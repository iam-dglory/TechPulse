// POST /api/companies/[id]/follow - Follow/Unfollow Company
import { supabase, verifyUser } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['POST', 'DELETE'].includes(req.method)) {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const { error: authError, user } = await verifyUser(req.headers.authorization);
    if (authError || !user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.query; // company_id

    // Check if company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, followers_count')
      .eq('id', id)
      .single();

    if (companyError || !company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    if (req.method === 'POST') {
      // Follow company
      const { data: existing } = await supabase
        .from('company_followers')
        .select('id')
        .eq('company_id', id)
        .eq('user_id', user.id)
        .single();

      if (existing) {
        return res.status(409).json({
          error: 'Already following',
          message: 'You are already following this company'
        });
      }

      const { error: insertError } = await supabase
        .from('company_followers')
        .insert([{
          company_id: id,
          user_id: user.id
        }]);

      if (insertError) {
        console.error('Follow error:', insertError);
        return res.status(500).json({ error: 'Failed to follow company' });
      }

      // Update followers count
      await supabase
        .from('companies')
        .update({ followers_count: (company.followers_count || 0) + 1 })
        .eq('id', id);

      return res.status(200).json({
        success: true,
        message: `You are now following ${company.name}`,
        data: {
          following: true,
          followers_count: (company.followers_count || 0) + 1
        }
      });

    } else if (req.method === 'DELETE') {
      // Unfollow company
      const { error: deleteError } = await supabase
        .from('company_followers')
        .delete()
        .eq('company_id', id)
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Unfollow error:', deleteError);
        return res.status(500).json({ error: 'Failed to unfollow company' });
      }

      // Update followers count
      await supabase
        .from('companies')
        .update({ followers_count: Math.max((company.followers_count || 1) - 1, 0) })
        .eq('id', id);

      return res.status(200).json({
        success: true,
        message: `You have unfollowed ${company.name}`,
        data: {
          following: false,
          followers_count: Math.max((company.followers_count || 1) - 1, 0)
        }
      });
    }

  } catch (error) {
    console.error('Follow/unfollow error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
