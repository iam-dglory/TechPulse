import OpenAI from 'openai';

export interface OpenAIScoreResult {
  hypeScore: number;
  ethicsScore: number;
  realityCheck: string;
  eli5Summary: string;
  hypeJustification: string;
  ethicsJustification: string;
  confidence: number;
  processingTime: number;
}

export interface StoryContent {
  title: string;
  content: string;
  sourceUrl?: string;
  companyId?: string;
}

export interface LocalScores {
  hypeScore: number;
  ethicsScore: number;
  impactTags: string[];
}

export class OpenAIScorer {
  private openai: OpenAI | null = null;
  private isConfigured: boolean = false;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.isConfigured = true;
      console.log('✅ OpenAI API configured for story scoring');
    } else {
      console.log('⚠️  OpenAI API key not found. LLM enhancements disabled.');
    }
  }

  /**
   * Enhance scores using OpenAI
   */
  async enhanceScores(
    storyContent: StoryContent,
    localScores: LocalScores
  ): Promise<OpenAIScoreResult | null> {
    if (!this.isConfigured || !this.openai) {
      return null;
    }

    const startTime = Date.now();

    try {
      const prompt = this.buildPrompt(storyContent, localScores);
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert tech ethics analyst and hype detector. Analyze the given story and provide:
1. Refined hype score (1-10)
2. Refined ethics score (1-10)
3. Reality check (2-3 sentences)
4. ELI5 summary (60-second read)
5. Hype justification (1-2 sentences)
6. Ethics justification (1-2 sentences)
7. Confidence level (0-1)

Be objective, factual, and helpful for users making informed decisions about technology.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error('No response from OpenAI');
      }

      const parsedResult = this.parseOpenAIResponse(response);
      const processingTime = Date.now() - startTime;

      return {
        ...parsedResult,
        processingTime
      };

    } catch (error) {
      console.error('OpenAI scoring error:', error);
      return null;
    }
  }

  /**
   * Build prompt for OpenAI
   */
  private buildPrompt(storyContent: StoryContent, localScores: LocalScores): string {
    return `
Analyze this tech story and provide enhanced scoring:

STORY TITLE: ${storyContent.title}

STORY CONTENT: ${storyContent.content}

SOURCE URL: ${storyContent.sourceUrl || 'Not provided'}

LOCAL ANALYSIS:
- Hype Score: ${localScores.hypeScore}/10
- Ethics Score: ${localScores.ethicsScore}/10
- Impact Tags: ${localScores.impactTags.join(', ')}

Please provide your analysis in the following JSON format:
{
  "hypeScore": <number 1-10>,
  "ethicsScore": <number 1-10>,
  "realityCheck": "<2-3 sentences about accuracy and verification>",
  "eli5Summary": "<60-second summary for general audience>",
  "hypeJustification": "<1-2 sentences explaining hype level>",
  "ethicsJustification": "<1-2 sentences explaining ethics score>",
  "confidence": <number 0-1>
}

Focus on:
- Marketing language vs factual claims
- Privacy, safety, and ethical implications
- Accuracy and verification of claims
- Potential biases or misleading information
- Real-world impact assessment
`;
  }

  /**
   * Parse OpenAI response
   */
  private parseOpenAIResponse(response: string): Omit<OpenAIScoreResult, 'processingTime'> {
    try {
      // Try to extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        return {
          hypeScore: Math.max(1, Math.min(10, Math.round(parsed.hypeScore || 5))),
          ethicsScore: Math.max(1, Math.min(10, Math.round(parsed.ethicsScore || 5))),
          realityCheck: parsed.realityCheck || 'Analysis pending',
          eli5Summary: parsed.eli5Summary || 'Summary unavailable',
          hypeJustification: parsed.hypeJustification || 'Hype analysis pending',
          ethicsJustification: parsed.ethicsJustification || 'Ethics analysis pending',
          confidence: Math.max(0, Math.min(1, parsed.confidence || 0.5))
        };
      }
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
    }

    // Fallback if JSON parsing fails
    return {
      hypeScore: 5,
      ethicsScore: 5,
      realityCheck: 'AI analysis failed - using local scores',
      eli5Summary: 'AI summary unavailable - please read full content',
      hypeJustification: 'AI analysis unavailable',
      ethicsJustification: 'AI analysis unavailable',
      confidence: 0.3
    };
  }

  /**
   * Generate 60-second summary
   */
  async generateSummary(storyContent: StoryContent): Promise<string | null> {
    if (!this.isConfigured || !this.openai) {
      return null;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Create a clear, concise 60-second summary of this tech story for a general audience. Focus on key facts and implications.'
          },
          {
            role: 'user',
            content: `Title: ${storyContent.title}\n\nContent: ${storyContent.content}`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('OpenAI summary error:', error);
      return null;
    }
  }

  /**
   * Generate reality check
   */
  async generateRealityCheck(storyContent: StoryContent): Promise<string | null> {
    if (!this.isConfigured || !this.openai) {
      return null;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Analyze this story for accuracy, verification, and potential issues. Provide a brief reality check focusing on what needs verification.'
          },
          {
            role: 'user',
            content: `Title: ${storyContent.title}\n\nContent: ${storyContent.content}\n\nSource: ${storyContent.sourceUrl || 'No source provided'}`
          }
        ],
        temperature: 0.2,
        max_tokens: 150
      });

      return completion.choices[0]?.message?.content || null;
    } catch (error) {
      console.error('OpenAI reality check error:', error);
      return null;
    }
  }

  /**
   * Check if OpenAI is configured
   */
  isOpenAIConfigured(): boolean {
    return this.isConfigured;
  }

  /**
   * Get configuration status
   */
  getConfigurationStatus(): { configured: boolean; hasApiKey: boolean } {
    return {
      configured: this.isConfigured,
      hasApiKey: !!process.env.OPENAI_API_KEY
    };
  }

  /**
   * Test OpenAI connection
   */
  async testConnection(): Promise<boolean> {
    if (!this.isConfigured || !this.openai) {
      return false;
    }

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Hello, this is a test message.'
          }
        ],
        max_tokens: 10
      });

      return !!completion.choices[0]?.message?.content;
    } catch (error) {
      console.error('OpenAI connection test failed:', error);
      return false;
    }
  }

  /**
   * Get API usage stats (if available)
   */
  async getUsageStats(): Promise<any> {
    if (!this.isConfigured || !this.openai) {
      return null;
    }

    try {
      // Note: This would require additional OpenAI API calls for usage data
      // For now, return a placeholder
      return {
        model: 'gpt-4',
        configured: true,
        lastUsed: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return null;
    }
  }
}


