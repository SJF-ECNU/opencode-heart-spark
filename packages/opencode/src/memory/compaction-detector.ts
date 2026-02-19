/**
 * Memory Compaction Detector
 *
 * Detect when context compaction is about to occur and trigger memory flush.
 */

/** Token estimation constants */
const AVG_TOKENS_PER_CHAR = 0.25;  // Approximate tokens per character
const DEFAULT_CONTEXT_LIMIT = 100000;  // Default context window

/** Compaction trigger thresholds */
const WARNING_THRESHOLD = 0.8;  // 80% of context used
const CRITICAL_THRESHOLD = 0.9;  // 90% of context used

/**
 * Estimate token count from text
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length * AVG_TOKENS_PER_CHAR);
}

/**
 * Check if memory flush should be triggered based on context size
 */
export function shouldTriggerMemoryFlush(
  currentTokens: number,
  limit: number = DEFAULT_CONTEXT_LIMIT
): {
  shouldFlush: boolean;
  level: 'none' | 'warning' | 'critical';
} {
  const ratio = currentTokens / limit;

  if (ratio >= CRITICAL_THRESHOLD) {
    return { shouldFlush: true, level: 'critical' };
  }

  if (ratio >= WARNING_THRESHOLD) {
    return { shouldFlush: true, level: 'warning' };
  }

  return { shouldFlush: false, level: 'none' };
}

/**
 * Calculate context usage percentage
 */
export function getContextUsagePercent(
  currentTokens: number,
  limit: number = DEFAULT_CONTEXT_LIMIT
): number {
  return Math.round((currentTokens / limit) * 100);
}

/**
 * Estimate tokens from messages array
 */
export function estimateMessagesTokens(messages: Array<{ content: string }>): number {
  return messages.reduce((total, msg) => total + estimateTokens(msg.content), 0);
}

/**
 * Create a compaction detector with custom thresholds
 */
export function createCompactionDetector(options: {
  warningThreshold?: number;
  criticalThreshold?: number;
  contextLimit?: number;
} = {}): {
  check: (tokens: number) => { shouldFlush: boolean; level: 'none' | 'warning' | 'critical' };
  getUsage: (tokens: number) => number;
} {
  const warning = options.warningThreshold ?? WARNING_THRESHOLD;
  const critical = options.criticalThreshold ?? CRITICAL_THRESHOLD;
  const limit = options.contextLimit ?? DEFAULT_CONTEXT_LIMIT;

  return {
    check: (tokens: number) => {
      const ratio = tokens / limit;
      if (ratio >= critical) return { shouldFlush: true, level: 'critical' };
      if (ratio >= warning) return { shouldFlush: true, level: 'warning' };
      return { shouldFlush: false, level: 'none' };
    },
    getUsage: (tokens: number) => Math.round((tokens / limit) * 100),
  };
}
