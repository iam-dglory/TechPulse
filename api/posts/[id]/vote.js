// POST /api/posts/[id]/vote - Vote on a post (protected)
import { supabase, verifyUser } from '../../_lib/supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const { error: authError, user } = await verifyUser(req.headers.authorization);

    if (authError || !user) {
      return res.status(401).json({ error: authError || 'Unauthorized' });
    }

    const { id } = req.query;
    const { vote_type, vote } = req.body;

    // Support both field names for compatibility
    const voteType = vote_type || vote;

    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type. Must be "up" or "down"' });
    }

    // Check if user already voted
    const { data: existingVote } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', user.id)
      .eq('post_id', id)
      .single();

    if (existingVote) {
      return res.status(400).json({ error: 'Already voted on this post' });
    }

    // Insert vote
    const { error: voteError } = await supabase
      .from('votes')
      .insert([{
        user_id: user.id,
        post_id: id,
        vote_type: voteType
      }]);

    if (voteError) {
      console.error('Vote insert error:', voteError);
      return res.status(500).json({ error: 'Failed to record vote', details: voteError.message });
    }

    // Update post vote counts
    const { data: post } = await supabase
      .from('posts')
      .select('votes_up, votes_down')
      .eq('id', id)
      .single();

    const updateData = voteType === 'up'
      ? { votes_up: (post.votes_up || 0) + 1 }
      : { votes_down: (post.votes_down || 0) + 1 };

    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', id)
      .select('votes_up, votes_down')
      .single();

    if (updateError) {
      console.error('Vote update error:', updateError);
      return res.status(500).json({ error: 'Failed to update vote count', details: updateError.message });
    }

    // Calculate and update hot score
    const { data: postData } = await supabase
      .from('posts')
      .select('created_at, votes_up, votes_down')
      .eq('id', id)
      .single();

    if (postData) {
      const timeDiff = (Date.now() - new Date(postData.created_at).getTime()) / (1000 * 60 * 60); // hours
      const hotScore = (postData.votes_up - postData.votes_down) / Math.max(timeDiff, 1);

      await supabase
        .from('posts')
        .update({ hot_score: hotScore })
        .eq('id', id);
    }

    return res.status(200).json({
      success: true,
      votes_up: updatedPost.votes_up,
      votes_down: updatedPost.votes_down
    });
  } catch (error) {
    console.error('Vote error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
