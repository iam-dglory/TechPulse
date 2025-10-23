// GET /api/posts - List all posts
// POST /api/posts - Create new post (protected)
import { supabase, verifyUser } from '../_lib/supabase.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - List posts
  if (req.method === 'GET') {
    try {
      const { sort = 'hot', limit = 20 } = req.query;

      let query = supabase
        .from('posts')
        .select('*');

      // Apply sorting
      if (sort === 'hot') {
        query = query.order('hot_score', { ascending: false });
      } else if (sort === 'top') {
        query = query.order('votes_up', { ascending: false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      query = query.limit(parseInt(limit));

      const { data, error } = await query;

      if (error) {
        console.error('Posts fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch posts', details: error.message });
      }

      // If no posts, return sample data
      if (!data || data.length === 0) {
        const samplePosts = [
          {
            id: 1,
            title: "AI Bias in Hiring Systems",
            content: "Multiple companies report AI systems showing bias against certain demographics in hiring processes.",
            type: "grievance",
            category: "AI Ethics",
            criticality: "high",
            ai_risk_score: 8,
            government_action: "pending",
            location: "Global",
            tags: ["AI", "Bias", "Hiring", "Discrimination"],
            votes_up: 15,
            votes_down: 2,
            hot_score: 13.5,
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            title: "ChatGPT-5 Released with Advanced Reasoning",
            content: "OpenAI announces ChatGPT-5 with significantly improved reasoning capabilities and multimodal understanding.",
            type: "ai_news",
            category: "AI Development",
            criticality: "medium",
            ai_risk_score: 5,
            government_action: null,
            location: "Global",
            tags: ["ChatGPT", "OpenAI", "AI", "Reasoning"],
            votes_up: 23,
            votes_down: 1,
            hot_score: 22.8,
            created_at: new Date().toISOString()
          }
        ];
        return res.status(200).json(samplePosts);
      }

      return res.status(200).json(data);
    } catch (error) {
      console.error('Posts error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  // POST - Create new post (protected)
  if (req.method === 'POST') {
    try {
      // Verify authentication
      const { error: authError, user } = await verifyUser(req.headers.authorization);

      if (authError || !user) {
        return res.status(401).json({ error: authError || 'Unauthorized' });
      }

      const { title, content, type, category, criticality, ai_risk_score, government_action, location, tags } = req.body;

      if (!title || !content || !type) {
        return res.status(400).json({ error: 'Title, content, and type are required' });
      }

      const { data, error } = await supabase
        .from('posts')
        .insert([{
          title,
          content,
          type,
          category,
          criticality: criticality || 'medium',
          ai_risk_score,
          government_action,
          location,
          tags,
          user_id: user.id,
          votes_up: 0,
          votes_down: 0,
          hot_score: 0
        }])
        .select()
        .single();

      if (error) {
        console.error('Post creation error:', error);
        return res.status(500).json({ error: 'Failed to create post', details: error.message });
      }

      return res.status(201).json({ success: true, post: data });
    } catch (error) {
      console.error('Post creation error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
