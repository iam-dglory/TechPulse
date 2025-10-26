// supabase/functions/ai_score/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { OpenAI } from 'https://esm.sh/openai@4.20.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  companyId: string;
  force?: boolean;
}

interface AIScoreResult {
  overall_score: number;
  privacy: number;
  transparency: number;
  labor: number;
  environment: number;
  community: number;
  summary: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get request body
    const body: RequestBody = await req.json()
    const { companyId, force = false } = body

    if (!companyId) {
      return new Response(
        JSON.stringify({ error: 'companyId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Check if we have a cached score less than 24 hours old (unless force=true)
    if (!force) {
      const twentyFourHoursAgo = new Date()
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24)

      const { data: cachedScore } = await supabase
        .from('score_history')
        .select('*')
        .eq('company_id', companyId)
        .gt('created_at', twentyFourHoursAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (cachedScore) {
        return new Response(
          JSON.stringify({ 
            data: cachedScore,
            cached: true 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Fetch company data
    const { data: company } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single()

    if (!company) {
      return new Response(
        JSON.stringify({ error: 'Company not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch latest reviews
    const { data: reviews } = await supabase
      .from('reviews')
      .select('*')
      .eq('company_id', companyId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(5)

    // Fetch latest news
    const { data: news } = await supabase
      .from('news_articles')
      .select('*')
      .eq('company_id', companyId)
      .order('published_at', { ascending: false })
      .limit(3)

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY') || '',
    });

    // Prepare system prompt
    const systemPrompt = "You are an AI ethics evaluator scoring companies on five dimensions: privacy (data handling practices), transparency (openness about operations), labor (employee treatment), environment (ecological impact), and community (social responsibility). Analyze the provided company data, reviews, and news to generate fair and objective scores on a scale of 0-100 for each dimension. Also provide an overall score and a concise summary of strengths and concerns.";
    
    // Prepare user prompt
    const userPrompt = `
Evaluate this company:
${JSON.stringify(company, null, 2)}
Recent reviews: ${JSON.stringify(reviews)}
Recent news: ${JSON.stringify(news)}
Return JSON strictly in this format:
{ "overall_score": ..., "privacy": ..., "transparency": ..., "labor": ..., "environment": ..., "community": ..., "summary": "..." }
`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.4,
    });

    // Parse the response
    const responseContent = completion.choices[0].message.content || '';
    let scoreResult: AIScoreResult;
    
    try {
      // Try to parse the entire response as JSON
      scoreResult = JSON.parse(responseContent);
    } catch (e) {
      // If that fails, try to extract JSON from the response
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Failed to parse AI response');
      }
      scoreResult = JSON.parse(jsonMatch[0]);
    }

    // Validate the score result
    const requiredFields = ['overall_score', 'privacy', 'transparency', 'labor', 'environment', 'community', 'summary'];
    for (const field of requiredFields) {
      if (scoreResult[field] === undefined) {
        throw new Error(`Missing required field in AI response: ${field}`);
      }
    }

    // Save score to history
    const { data: scoreHistory, error: scoreError } = await supabase
      .from('score_history')
      .insert({
        company_id: companyId,
        overall_score: scoreResult.overall_score,
        privacy_score: scoreResult.privacy,
        transparency_score: scoreResult.transparency,
        labor_score: scoreResult.labor,
        environment_score: scoreResult.environment,
        community_score: scoreResult.community,
        summary: scoreResult.summary,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (scoreError) {
      throw scoreError
    }

    // Update company with latest scores
    await supabase
      .from('companies')
      .update({
        overall_score: scoreResult.overall_score,
        privacy_score: scoreResult.privacy,
        transparency_score: scoreResult.transparency,
        labor_score: scoreResult.labor,
        environment_score: scoreResult.environment,
        community_score: scoreResult.community,
        last_scored_at: new Date().toISOString()
      })
      .eq('id', companyId)

    return new Response(
      JSON.stringify({ 
        data: scoreHistory,
        cached: false
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('AI scoring error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})