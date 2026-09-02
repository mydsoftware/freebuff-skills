/**
 * SafetyFilter — Content moderation and guardrails for AI interactions.
 * Prevents prompt injection, sensitive data leaks, and harmful content.
 */

class SafetyFilter {
  constructor(config = {}) {
    this.blockedPatterns = config.blockedPatterns || [
      /ignore\s+(all\s+)?previous\s+instructions/i,
      /you\s+are\s+now\s+(a|an)\s+/i,
      /system\s*prompt/i,
      /disregard\s+(all|any|previous)/i,
    ];
    this.sensitivePatterns = config.sensitivePatterns || [
      /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/,  // Credit card
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
      /\b\d{10,11}\b/, // Phone numbers (basic)
      /password\s*[:=]\s*\S+/i,
      /api[_-]?key\s*[:=]\s*\S+/i,
      /secret\s*[:=]\s*\S+/i,
    ];
    this.maxPromptLength = config.maxPromptLength || 100000;
    this.enabled = config.enabled !== false;
  }

  /**
   * Check a prompt for safety issues.
   * @param {string} prompt
   * @returns {{allowed: boolean, reason?: string, warnings: string[]}}
   */
  check(prompt) {
    if (!this.enabled) return { allowed: true, warnings: [] };

    const warnings = [];

    // Length check
    if (prompt.length > this.maxPromptLength) {
      return { allowed: false, reason: 'Prompt exceeds maximum length', warnings };
    }

    // Blocked patterns (prompt injection)
    for (const pattern of this.blockedPatterns) {
      if (pattern.test(prompt)) {
        return { allowed: false, reason: `Prompt contains blocked pattern: ${pattern.source}`, warnings };
      }
    }

    // Sensitive data detection (warning only)
    for (const pattern of this.sensitivePatterns) {
      if (pattern.test(prompt)) {
        warnings.push(`Potential sensitive data detected: ${pattern.source}`);
      }
    }

    return { allowed: true, warnings };
  }

  /**
   * Check AI output for safety issues.
   */
  checkOutput(text) {
    if (!this.enabled) return { safe: true, warnings: [] };

    const warnings = [];
    for (const pattern of this.sensitivePatterns) {
      if (pattern.test(text)) {
        warnings.push(`AI output may contain sensitive data`);
      }
    }

    return { safe: warnings.length === 0, warnings };
  }

  addBlockedPattern(pattern) {
    this.blockedPatterns.push(pattern);
  }

  addSensitivePattern(pattern) {
    this.sensitivePatterns.push(pattern);
  }
}

module.exports = { SafetyFilter };
