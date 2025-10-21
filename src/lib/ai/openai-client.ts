/**
 * OpenAI Client Configuration
 *
 * Provides configured OpenAI client with retry logic and error handling
 */

import OpenAI from 'openai';

// Environment validation
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is not set');
}

/**
 * Configured OpenAI client instance
 */
export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  maxRetries: 3,
  timeout: 60000, // 60 seconds
});

/**
 * Retry configuration
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getRetryDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelayMs
  );
  // Add jitter (±20% randomization)
  const jitter = delay * 0.2 * (Math.random() - 0.5);
  return Math.floor(delay + jitter);
}

/**
 * Error types that should trigger a retry
 */
function isRetryableError(error: any): boolean {
  // Retry on rate limits, timeouts, and server errors
  if (error?.status) {
    return error.status === 429 || error.status >= 500;
  }

  // Retry on network errors
  if (error?.code === 'ECONNRESET' || error?.code === 'ETIMEDOUT') {
    return true;
  }

  return false;
}

/**
 * Wrapper function with retry logic and error handling
 *
 * @param fn - Async function to execute
 * @param context - Context description for logging
 * @returns Promise with function result
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  context: string = 'OpenAI API call'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Log the error
      console.error(`${context} failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1}):`, {
        message: error?.message,
        status: error?.status,
        code: error?.code,
      });

      // Don't retry if this is the last attempt
      if (attempt === RETRY_CONFIG.maxRetries) {
        break;
      }

      // Don't retry if error is not retryable
      if (!isRetryableError(error)) {
        console.error(`${context} - Non-retryable error, aborting retries`);
        break;
      }

      // Calculate delay and wait
      const delay = getRetryDelay(attempt);
      console.log(`${context} - Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // All retries exhausted or non-retryable error
  throw new Error(`${context} failed after ${RETRY_CONFIG.maxRetries + 1} attempts: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Rate limiting tracker (simple in-memory implementation)
 * In production, use Redis for distributed rate limiting
 */
const rateLimitTracker = new Map<string, { count: number; resetTime: number }>();

/**
 * Check and update rate limit
 *
 * @param key - Rate limit key (e.g., 'company:analysis:123')
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  key: string,
  maxRequests: number = 10,
  windowMs: number = 60 * 60 * 1000 // 1 hour default
): boolean {
  const now = Date.now();
  const tracker = rateLimitTracker.get(key);

  if (!tracker || now > tracker.resetTime) {
    // Create new window
    rateLimitTracker.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return true;
  }

  if (tracker.count >= maxRequests) {
    return false;
  }

  tracker.count++;
  return true;
}

/**
 * Clean up expired rate limit entries (call periodically)
 */
export function cleanupRateLimitTracker(): void {
  const now = Date.now();
  for (const [key, tracker] of rateLimitTracker.entries()) {
    if (now > tracker.resetTime) {
      rateLimitTracker.delete(key);
    }
  }
}

// Cleanup every 5 minutes
setInterval(cleanupRateLimitTracker, 5 * 60 * 1000);

/**
 * Estimate cost of OpenAI API call
 * GPT-4 pricing (as of Jan 2025): ~$0.03 per 1K input tokens, ~$0.06 per 1K output tokens
 *
 * @param inputTokens - Number of input tokens
 * @param outputTokens - Number of output tokens
 * @param model - Model name
 * @returns Estimated cost in USD
 */
export function estimateCost(
  inputTokens: number,
  outputTokens: number,
  model: string = 'gpt-4'
): number {
  const pricing: Record<string, { input: number; output: number }> = {
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
  };

  const rates = pricing[model] || pricing['gpt-4'];
  const inputCost = (inputTokens / 1000) * rates.input;
  const outputCost = (outputTokens / 1000) * rates.output;

  return inputCost + outputCost;
}

/**
 * Log AI API call for monitoring
 *
 * @param params - Call parameters
 */
export async function logAICall(params: {
  analysisType: string;
  companyId?: string;
  success: boolean;
  cost?: number;
  duration: number;
  error?: string;
  inputTokens?: number;
  outputTokens?: number;
}): Promise<void> {
  // In production, send to monitoring service (e.g., Datadog, Sentry)
  console.log('[AI Call]', {
    timestamp: new Date().toISOString(),
    ...params,
  });

  // TODO: Store in database for analytics
  // await supabase.from('ai_call_logs').insert({
  //   analysis_type: params.analysisType,
  //   company_id: params.companyId,
  //   success: params.success,
  //   cost: params.cost,
  //   duration_ms: params.duration,
  //   error: params.error,
  //   input_tokens: params.inputTokens,
  //   output_tokens: params.outputTokens,
  // });
}
