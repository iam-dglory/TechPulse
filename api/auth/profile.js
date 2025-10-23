// GET /api/auth/profile - Get user profile (protected)
import { verifyUser } from '../_lib/supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const { error: authError, user } = await verifyUser(req.headers.authorization);

    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized' });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.user_metadata?.username,
        full_name: user.user_metadata?.full_name,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
