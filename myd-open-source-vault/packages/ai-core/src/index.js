/**
 * @myd/ai-core
 * Provider-agnostic AI layer with model routing, cost tracking, fallback, and safety.
 *
 * Architecture:
 *   ProviderManager → ModelRouter → Provider (OpenRouter / OpenAI / Ollama / custom)
 *                                    ↕
 *                              CostTracker + SafetyFilter
 */

const { ProviderManager } = require('./provider-manager');
const { ModelRouter } = require('./model-router');
const { CostTracker } = require('./cost-tracker');
const { SafetyFilter } = require('./safety-filter');
const { PromptManager } = require('./prompt-manager');

class MydAiCore {
  /**
   * @param {object} config
   * @param {object[]} config.providers - Provider configurations
   * @param {object} config.routing - Model routing rules
   * @param {object} config.safety - Safety filter config
   * @param {object} config.costs - Cost limits
   */
  constructor(config = {}) {
    this.providerManager = new ProviderManager(config.providers || []);
    this.modelRouter = new ModelRouter(config.routing || {});
    this.costTracker = new CostTracker(config.costs || {});
    this.safetyFilter = new SafetyFilter(config.safety || {});
    this.promptManager = new PromptManager();
    this._initialized = false;
  }

  async initialize() {
    await this.providerManager.initialize();
    this._initialized = true;
    return this;
  }

  /**
   * Generate text completion
   * @param {object} params
   * @param {string} params.task - Task type (coding, reasoning, translation, vision, general)
   * @param {string} params.prompt - User prompt
   * @param {object} [params.options] - Override options
   * @returns {Promise<{text: string, model: string, provider: string, usage: object}>}
   */
  async generate({ task = 'general', prompt, options = {} }) {
    if (!this._initialized) throw new Error('MydAiCore not initialized. Call initialize() first.');

    // Safety check
    const safetyResult = this.safetyFilter.check(prompt);
    if (!safetyResult.allowed) {
      return { text: null, error: safetyResult.reason, blocked: true };
    }

    // Route to best model
    const { provider, model } = this.modelRouter.route(task, options);

    // Check cost limits
    if (!this.costTracker.canAfford(model, options.maxTokens || 4096)) {
      // Fallback to cheaper model
      const fallback = this.modelRouter.getFallback(model);
      if (!fallback) {
        return { text: null, error: 'Cost limit exceeded and no fallback available', costLimited: true };
      }
      return this.generate({ task, prompt, options: { ...options, _overrideModel: fallback } });
    }

    // Get provider instance
    const providerInstance = this.providerManager.getProvider(provider);
    if (!providerInstance) {
      return { text: null, error: `Provider "${provider}" not available` };
    }

    // Generate
    const result = await providerInstance.generate({
      model: options._overrideModel || model,
      prompt,
      ...options,
    });

    // Track cost
    if (result.usage) {
      this.costTracker.recordUsage(model, result.usage);
    }

    return {
      ...result,
      model: options._overrideModel || model,
      provider,
    };
  }

  /**
   * Stream text completion
   * @param {object} params
   * @returns {AsyncGenerator<{chunk: string}>}
   */
  async *stream({ task = 'general', prompt, options = {} }) {
    if (!this._initialized) throw new Error('MydAiCore not initialized.');

    const safetyResult = this.safetyFilter.check(prompt);
    if (!safetyResult.allowed) {
      yield { chunk: '', error: safetyResult.reason, blocked: true };
      return;
    }

    const { provider, model } = this.modelRouter.route(task, options);
    const providerInstance = this.providerManager.getProvider(provider);

    if (!providerInstance || !providerInstance.stream) {
      throw new Error(`Streaming not supported for provider "${provider}"`);
    }

    yield* providerInstance.stream({ model, prompt, ...options });
  }

  /**
   * Generate embeddings
   * @param {object} params
   * @param {string|string[]} params.text
   * @param {string} [params.model]
   * @returns {Promise<{embeddings: number[][], model: string}>}
   */
  async embed({ text, model }) {
    if (!this._initialized) throw new Error('MydAiCore not initialized.');

    const providerName = model
      ? this.providerManager.findProviderForModel(model)
      : this.providerManager.getEmbeddingProvider();

    const providerInstance = this.providerManager.getProvider(providerName);
    if (!providerInstance || !providerInstance.embed) {
      throw new Error(`Embedding not supported for provider "${providerName}"`);
    }

    return providerInstance.embed({ text, model });
  }

  /**
   * Structured output generation
   * @param {object} params
   * @param {string} params.prompt
   * @param {object} params.schema - JSON schema for output
   * @param {string} [params.task]
   * @returns {Promise<object>}
   */
  async structuredOutput({ prompt, schema, task = 'general' }) {
    const result = await this.generate({
      task,
      prompt: `${prompt}\n\nRespond with valid JSON matching this schema:\n${JSON.stringify(schema, null, 2)}`,
    });

    if (result.error) return result;

    try {
      return { data: JSON.parse(result.text), model: result.model, provider: result.provider, usage: result.usage };
    } catch {
      // Try to extract JSON from markdown code block
      const match = result.text.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (match) {
        try {
          return { data: JSON.parse(match[1]), model: result.model, provider: result.provider, usage: result.usage };
        } catch {
          return { data: null, error: 'Failed to parse structured output', raw: result.text };
        }
      }
      return { data: null, error: 'Failed to parse structured output', raw: result.text };
    }
  }

  /**
   * Get cost summary
   */
  getCostSummary() {
    return this.costTracker.getSummary();
  }

  /**
   * Add a provider at runtime
   */
  addProvider(config) {
    this.providerManager.addProvider(config);
  }
}

module.exports = { MydAiCore, ProviderManager, ModelRouter, CostTracker, SafetyFilter, PromptManager };
