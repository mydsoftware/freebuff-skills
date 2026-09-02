/**
 * ModelRouter — Routes tasks to the best model/provider combination.
 * Supports task-based routing, fallback chains, and cost optimization.
 */

const DEFAULT_ROUTING = {
  coding: { preferred: ['codestral', 'deepseek-coder', 'gpt-4o', 'claude-3.5-sonnet'], fallback: ['gpt-4o-mini'] },
  reasoning: { preferred: ['gpt-4o', 'claude-3.5-sonnet', 'o1'], fallback: ['gpt-4o-mini'] },
  translation: { preferred: ['gpt-4o', 'claude-3.5-sonnet'], fallback: ['gpt-4o-mini', 'gemini-flash'] },
  vision: { preferred: ['gpt-4o', 'claude-3.5-sonnet', 'gemini-pro-vision'], fallback: [] },
  image_generation: { preferred: ['dall-e-3', 'stable-diffusion'], fallback: [] },
  embedding: { preferred: ['text-embedding-3-small', 'nomic-embed'], fallback: [] },
  general: { preferred: ['gpt-4o-mini', 'claude-3-haiku', 'gemini-flash'], fallback: [] },
  cheap: { preferred: ['gpt-4o-mini', 'claude-3-haiku', 'gemini-flash', 'deepseek-chat'], fallback: [] },
};

class ModelRouter {
  constructor(config = {}) {
    this.routing = { ...DEFAULT_ROUTING, ...config };
    this.availableModels = config.availableModels || [];
  }

  /**
   * Route a task to the best available model.
   * @param {string} task - Task type
   * @param {object} options - Override options
   * @returns {{provider: string, model: string}}
   */
  route(task, options = {}) {
    if (options._overrideModel) {
      return this._parseModel(options._overrideModel);
    }

    const rule = this.routing[task] || this.routing.general;
    const candidates = [...rule.preferred, ...rule.fallback];

    for (const model of candidates) {
      if (this.isAvailable(model)) {
        return this._parseModel(model);
      }
    }

    // Ultimate fallback: first available model
    if (this.availableModels.length > 0) {
      return this._parseModel(this.availableModels[0]);
    }

    return { provider: 'openrouter', model: 'gpt-4o-mini' };
  }

  /**
   * Get a fallback model for when the primary is unavailable or cost-limited.
   */
  getFallback(model) {
    for (const [, rule] of Object.entries(this.routing)) {
      const all = [...rule.preferred, ...rule.fallback];
      const idx = all.indexOf(model);
      if (idx >= 0 && idx < all.length - 1) {
        return all[idx + 1];
      }
    }
    // Fallback to cheapest general model
    const cheap = this.routing.cheap;
    return cheap.preferred[cheap.preferred.length - 1] || null;
  }

  isAvailable(model) {
    if (this.availableModels.length === 0) return true; // No restriction
    return this.availableModels.includes(model);
  }

  _parseModel(modelStr) {
    // Simple: all models route through OpenRouter by default
    // In production, this would resolve to the right provider
    return { provider: 'openrouter', model: modelStr };
  }

  addRoutingRule(task, rule) {
    this.routing[task] = rule;
  }
}

module.exports = { ModelRouter };
