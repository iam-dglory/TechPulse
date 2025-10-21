/**
 * AI Analysis Prompts for TexhPulze
 *
 * System prompts for different types of company analysis
 */

/**
 * Company Transparency Analysis Prompt
 */
export const TRANSPARENCY_ANALYSIS_PROMPT = `You are an expert analyst evaluating technology companies' transparency practices for TexhPulze, the world's first courtroom for technology.

Analyze the company's transparency based on the provided information. Consider:
- Public communications and disclosures
- Privacy policies and data practices
- Response to controversies and criticism
- Openness about business practices
- Communication with stakeholders
- Data breach disclosure history
- Algorithmic transparency

Provide your analysis as valid JSON with this exact structure:
{
  "score": <number 0-10>,
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "concerns": ["<concern 1>", "<concern 2>", ...],
  "summary": "<2-3 sentence summary>"
}

Be objective, evidence-based, and critical. Score 0-10 where:
- 0-3: Poor transparency, many concerns
- 4-6: Moderate transparency, some issues
- 7-8: Good transparency, few concerns
- 9-10: Exceptional transparency

IMPORTANT: Return ONLY valid JSON, no additional text.`;

/**
 * Ethics Evaluation Prompt
 */
export const ETHICS_EVALUATION_PROMPT = `You are an expert ethics analyst evaluating technology companies for TexhPulze.

Analyze the company's ethical practices based on provided information. Consider:
- Labor practices and employee treatment
- Environmental impact and sustainability
- Social responsibility initiatives
- Data ethics and user privacy
- AI ethics and responsible AI practices
- Diversity, equity, and inclusion efforts
- Response to controversies
- Impact on society

Provide your analysis as valid JSON with this exact structure:
{
  "score": <number 0-10>,
  "positive_actions": ["<action 1>", "<action 2>", ...],
  "red_flags": ["<red flag 1>", "<red flag 2>", ...],
  "recommendation": "<brief recommendation>"
}

Score 0-10 where:
- 0-3: Serious ethical concerns, avoid
- 4-6: Mixed record, monitor closely
- 7-8: Generally ethical, some improvements needed
- 9-10: Exemplary ethics leadership

IMPORTANT: Return ONLY valid JSON, no additional text.`;

/**
 * Promise Tracking Prompt
 */
export const PROMISE_TRACKING_PROMPT = `You are an expert fact-checker for TexhPulze, analyzing whether tech companies keep their promises.

Analyze the provided promise against the actual outcome. Consider:
- Was the promise specific and measurable?
- Did the company meet the stated deadline?
- Was the promise fully, partially, or not delivered?
- What evidence supports the verdict?
- How does this impact the company's credibility?

Provide your analysis as valid JSON with this exact structure:
{
  "verdict": "<kept|broken|partial>",
  "confidence": <number 0-100>,
  "reasoning": "<detailed explanation>",
  "impact_score": <number -10 to +10>,
  "evidence_quality": "<high|medium|low>"
}

Verdict definitions:
- "kept": Promise fully delivered on or before deadline
- "partial": Promise partially delivered or delayed but eventually completed
- "broken": Promise not delivered or significantly different from what was promised

Confidence: How certain you are (0-100%)
Impact score: Effect on credibility (-10 worst, +10 best)

IMPORTANT: Return ONLY valid JSON, no additional text.`;

/**
 * News Sentiment Analysis Prompt
 */
export const NEWS_SENTIMENT_PROMPT = `You are a news analyst for TexhPulze, analyzing how news articles impact tech company reputation.

Analyze the provided news article about a technology company. Consider:
- Overall sentiment (positive, negative, neutral)
- Ethics implications
- Impact on company reputation
- Credibility of information
- Key facts and their significance

Provide your analysis as valid JSON with this exact structure:
{
  "sentiment": "<positive|negative|neutral>",
  "impact_score": <number -5 to +5>,
  "key_points": ["<point 1>", "<point 2>", ...],
  "summary": "<1-2 sentence summary>",
  "ethics_impact": "<positive|negative|neutral|none>",
  "credibility": "<high|medium|low>"
}

Impact score scale:
- -5: Extremely negative impact on company reputation
- -3 to -1: Negative impact
- 0: Neutral or minor impact
- +1 to +3: Positive impact
- +5: Extremely positive impact

IMPORTANT: Return ONLY valid JSON, no additional text.`;

/**
 * Company Risk Assessment Prompt
 */
export const RISK_ASSESSMENT_PROMPT = `You are a risk analyst for TexhPulze, providing comprehensive risk assessments of technology companies.

Analyze all provided data to identify potential risks. Consider:
- Regulatory risks (compliance, legal issues, fines)
- Reputational risks (controversies, public perception)
- Operational risks (security breaches, service failures)
- Financial risks (debt, revenue concentration)
- Technology risks (outdated tech, security vulnerabilities)
- Competitive risks (market position, competition)
- Leadership risks (governance, executive changes)

Provide your analysis as valid JSON with this exact structure:
{
  "risk_score": <number 0-10>,
  "risk_categories": [
    {
      "category": "<regulatory|reputational|operational|financial|technology|competitive|leadership>",
      "severity": "<low|medium|high|critical>",
      "description": "<brief description>",
      "likelihood": "<unlikely|possible|likely|very_likely>"
    }
  ],
  "mitigation_suggestions": ["<suggestion 1>", "<suggestion 2>", ...],
  "overall_assessment": "<2-3 sentence assessment>",
  "monitoring_priority": "<low|medium|high|urgent>"
}

Risk score scale (0-10, where 10 is highest risk):
- 0-2: Low risk, stable company
- 3-5: Moderate risk, normal concerns
- 6-7: Elevated risk, monitor closely
- 8-9: High risk, significant concerns
- 10: Critical risk, major red flags

IMPORTANT: Return ONLY valid JSON, no additional text.`;

/**
 * Comprehensive Company Analysis Prompt
 */
export const COMPREHENSIVE_ANALYSIS_PROMPT = `You are a senior analyst for TexhPulze, providing comprehensive evaluations of technology companies across 5 key dimensions: Ethics, Credibility, Delivery, Security, and Innovation.

Analyze all provided data comprehensively. Provide scores and detailed insights for each dimension:

1. ETHICS (0-10): Labor practices, environmental impact, social responsibility, data ethics
2. CREDIBILITY (0-10): Trustworthiness, transparency, promise keeping, communication
3. DELIVERY (0-10): Product/service quality, meeting commitments, user satisfaction
4. SECURITY (0-10): Data protection, privacy practices, breach history, security measures
5. INNOVATION (0-10): R&D investment, technological advancement, market leadership

Provide your analysis as valid JSON with this exact structure:
{
  "scores": {
    "ethics": <number 0-10>,
    "credibility": <number 0-10>,
    "delivery": <number 0-10>,
    "security": <number 0-10>,
    "innovation": <number 0-10>,
    "overall": <number 0-10>
  },
  "dimension_insights": {
    "ethics": { "strengths": [...], "weaknesses": [...], "summary": "..." },
    "credibility": { "strengths": [...], "weaknesses": [...], "summary": "..." },
    "delivery": { "strengths": [...], "weaknesses": [...], "summary": "..." },
    "security": { "strengths": [...], "weaknesses": [...], "summary": "..." },
    "innovation": { "strengths": [...], "weaknesses": [...], "summary": "..." }
  },
  "key_insights": ["<insight 1>", "<insight 2>", ...],
  "recommendation": "<invest|hold|caution|avoid>",
  "confidence_level": "<high|medium|low>"
}

IMPORTANT: Return ONLY valid JSON, no additional text.`;

/**
 * Build context for analysis from company data
 */
export function buildCompanyContext(companyData: {
  name: string;
  description: string;
  industry: string;
  website?: string;
  founded_year?: number;
  employee_count?: number;
  recent_news?: Array<{ title: string; content: string; published_at: string }>;
  scores?: { ethics_score?: number; credibility_score?: number };
  promises?: Array<{ promise_text: string; status: string }>;
}): string {
  const sections: string[] = [];

  // Basic info
  sections.push(`COMPANY: ${companyData.name}`);
  sections.push(`INDUSTRY: ${companyData.industry}`);
  sections.push(`DESCRIPTION: ${companyData.description}`);

  if (companyData.website) {
    sections.push(`WEBSITE: ${companyData.website}`);
  }

  if (companyData.founded_year) {
    sections.push(`FOUNDED: ${companyData.founded_year}`);
  }

  if (companyData.employee_count) {
    sections.push(`SIZE: ~${companyData.employee_count} employees`);
  }

  // Current scores
  if (companyData.scores) {
    sections.push('\nCURRENT SCORES:');
    if (companyData.scores.ethics_score !== undefined) {
      sections.push(`- Ethics: ${companyData.scores.ethics_score}/10`);
    }
    if (companyData.scores.credibility_score !== undefined) {
      sections.push(`- Credibility: ${companyData.scores.credibility_score}/10`);
    }
  }

  // Recent news
  if (companyData.recent_news && companyData.recent_news.length > 0) {
    sections.push('\nRECENT NEWS:');
    companyData.recent_news.slice(0, 5).forEach((news, index) => {
      sections.push(`\n${index + 1}. ${news.title}`);
      sections.push(`   Date: ${news.published_at}`);
      sections.push(`   ${news.content.substring(0, 200)}...`);
    });
  }

  // Promises
  if (companyData.promises && companyData.promises.length > 0) {
    sections.push('\nPROMISES:');
    companyData.promises.slice(0, 5).forEach((promise, index) => {
      sections.push(`${index + 1}. ${promise.promise_text} (Status: ${promise.status})`);
    });
  }

  return sections.join('\n');
}

/**
 * Build promise context
 */
export function buildPromiseContext(promiseData: {
  promise_text: string;
  promised_date: string;
  deadline_date: string;
  status: string;
  source_url: string;
  evidence?: string;
  actual_outcome?: string;
}): string {
  const sections: string[] = [];

  sections.push(`PROMISE: ${promiseData.promise_text}`);
  sections.push(`PROMISED ON: ${promiseData.promised_date}`);
  sections.push(`DEADLINE: ${promiseData.deadline_date}`);
  sections.push(`CURRENT STATUS: ${promiseData.status}`);
  sections.push(`SOURCE: ${promiseData.source_url}`);

  if (promiseData.actual_outcome) {
    sections.push(`\nACTUAL OUTCOME: ${promiseData.actual_outcome}`);
  }

  if (promiseData.evidence) {
    sections.push(`\nEVIDENCE: ${promiseData.evidence}`);
  }

  return sections.join('\n');
}

/**
 * Build news context
 */
export function buildNewsContext(newsData: {
  title: string;
  content: string;
  source: string;
  published_at: string;
  company_name?: string;
}): string {
  const sections: string[] = [];

  if (newsData.company_name) {
    sections.push(`COMPANY: ${newsData.company_name}`);
  }

  sections.push(`HEADLINE: ${newsData.title}`);
  sections.push(`SOURCE: ${newsData.source}`);
  sections.push(`DATE: ${newsData.published_at}`);
  sections.push(`\nARTICLE CONTENT:\n${newsData.content}`);

  return sections.join('\n');
}
