// GET /api/companies - List all companies
import { supabase } from '../_lib/supabase.js';

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
    const { limit = 50, search, category } = req.query;

    let query = supabase
      .from('companies')
      .select('*');

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    query = query.order('accountability_score', { ascending: false });
    query = query.limit(parseInt(limit));

    const { data, error } = await query;

    if (error) {
      console.error('Companies fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch companies', details: error.message });
    }

    // If no companies, return sample data
    if (!data || data.length === 0) {
      const sampleCompanies = [
        {
          id: 1,
          name: "OpenAI",
          description: "AI research and deployment company",
          category: "AI Research",
          accountability_score: 85,
          total_reviews: 150,
          positive_reviews: 120,
          negative_reviews: 30,
          website: "https://openai.com",
          logo_url: null,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: "Google DeepMind",
          description: "AI research lab and subsidiary of Alphabet",
          category: "AI Research",
          accountability_score: 78,
          total_reviews: 200,
          positive_reviews: 140,
          negative_reviews: 60,
          website: "https://deepmind.google",
          logo_url: null,
          created_at: new Date().toISOString()
        },
        {
          id: 3,
          name: "Meta AI",
          description: "Artificial intelligence research division of Meta Platforms",
          category: "AI Research",
          accountability_score: 65,
          total_reviews: 180,
          positive_reviews: 90,
          negative_reviews: 90,
          website: "https://ai.meta.com",
          logo_url: null,
          created_at: new Date().toISOString()
        }
      ];
      return res.status(200).json(sampleCompanies);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Companies error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
