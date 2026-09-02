/**
 * CostTracker — Tracks AI usage costs per model, per agent, per tenant.
 * Enforces daily/monthly limits and generates cost reports.
 */

// Approximate costs per 1K tokens (USD)
const MODEL_COSTS = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'claude-3.5-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'deepseek-coder': { input: 0.00014, output: 0.00028 },
  'deepseek-chat': { input: 0.00014, output: 0.00028 },
  'gemini-flash': { input: 0.000075, output: 0.0003 },
  'o1': { input: 0.015, output: 0.06 },
};

class CostTracker {
  constructor(config = {}) {
    this.dailyLimit = config.dailyLimit || 50; // USD
    this.monthlyLimit = config.monthlyLimit || 1000; // USD
    this.modelLimits = config.modelLimits || {};
    this.agentLimits = config.agentLimits || {};
    this.records = [];
    this._dailyTotal = 0;
    this._monthlyTotal = 0;
    this._lastResetDay = this._today();
    this._lastResetMonth = this._thisMonth();
  }

  _today() { return new Date().toISOString().slice(0, 10); }
  _thisMonth() { return new Date().toISOString().slice(0, 7); }

  _resetIfNeeded() {
    const today = this._today();
    if (today !== this._lastResetDay) {
      this._dailyTotal = 0;
      this._lastResetDay = today;
    }
    const month = this._thisMonth();
    if (month !== this._lastResetMonth) {
      this._monthlyTotal = 0;
      this._lastResetMonth = month;
    }
  }

  /**
   * Estimate cost for a request
   */
  estimateCost(model, inputTokens, outputTokens) {
    const costs = MODEL_COSTS[model] || { input: 0.001, output: 0.003 };
    return (inputTokens / 1000) * costs.input + (outputTokens / 1000) * costs.output;
  }

  /**
   * Check if we can afford a request
   */
  canAfford(model, estimatedTokens = 4096) {
    this._resetIfNeeded();
    const estimatedCost = this.estimateCost(model, estimatedTokens, estimatedTokens / 2);

    if (this._dailyTotal + estimatedCost > this.dailyLimit) return false;
    if (this._monthlyTotal + estimatedCost > this.monthlyLimit) return false;

    // Model-specific limits
    if (this.modelLimits[model]) {
      const modelUsed = this.records
        .filter(r => r.model === model && r.month === this._thisMonth())
        .reduce((sum, r) => sum + r.cost, 0);
      if (modelUsed + estimatedCost > this.modelLimits[model]) return false;
    }

    return true;
  }

  /**
   * Record actual usage after a request
   */
  recordUsage(model, usage) {
    this._resetIfNeeded();
    const inputTokens = usage.prompt_tokens || usage.input_tokens || 0;
    const outputTokens = usage.completion_tokens || usage.output_tokens || 0;
    const cost = this.estimateCost(model, inputTokens, outputTokens);

    const record = {
      model,
      inputTokens,
      outputTokens,
      cost,
      totalTokens: inputTokens + outputTokens,
      date: this._today(),
      month: this._thisMonth(),
      timestamp: new Date().toISOString(),
    };

    this.records.push(record);
    this._dailyTotal += cost;
    this._monthlyTotal += cost;

    return record;
  }

  /**
   * Get cost summary
   */
  getSummary() {
    this._resetIfNeeded();
    const byModel = {};
    for (const r of this.records) {
      if (!byModel[r.model]) byModel[r.model] = { requests: 0, tokens: 0, cost: 0 };
      byModel[r.model].requests++;
      byModel[r.model].tokens += r.totalTokens;
      byModel[r.model].cost += r.cost;
    }

    return {
      dailyTotal: Math.round(this._dailyTotal * 10000) / 10000,
      monthlyTotal: Math.round(this._monthlyTotal * 10000) / 10000,
      dailyLimit: this.dailyLimit,
      monthlyLimit: this.monthlyLimit,
      totalRequests: this.records.length,
      byModel,
    };
  }

  /**
   * Get records for a specific period
   */
  getRecords(filter = {}) {
    let records = [...this.records];
    if (filter.model) records = records.filter(r => r.model === filter.model);
    if (filter.date) records = records.filter(r => r.date === filter.date);
    if (filter.month) records = records.filter(r => r.month === filter.month);
    return records;
  }
}

module.exports = { CostTracker, MODEL_COSTS };
