/**
 * AnalyticsAdapter — Privacy-aware analytics for MYD products.
 * Tracks: page views, features, conversions, AI usage, revenue.
 */

class AnalyticsAdapter {
  constructor(config = {}) {
    this.tenantId = config.tenantId || 'default';
    this.events = [];
    this.enabled = config.enabled !== false;
    this.privacyMode = config.privacyMode || false; // No PII tracking
  }

  /**
   * Track an event
   * @param {string} category
   * @param {string} action
   * @param {object} [properties]
   */
  track(category, action, properties = {}) {
    if (!this.enabled) return;

    const event = {
      category,
      action,
      properties: this.privacyMode ? this._sanitize(properties) : properties,
      timestamp: new Date().toISOString(),
      tenantId: this.tenantId,
    };

    this.events.push(event);
    if (this.events.length > 5000) this.events = this.events.slice(-2500);
    return event;
  }

  /**
   * Track page view
   */
  trackPageView(page, userId) {
    return this.track('page', 'view', {
      page,
      userId: this.privacyMode ? this._hash(userId) : userId,
    });
  }

  /**
   * Track feature usage
   */
  trackFeature(feature, action, userId) {
    return this.track('feature', action, { feature, userId: this.privacyMode ? this._hash(userId) : userId });
  }

  /**
   * Track AI usage
   */
  trackAIUsage(model, tokens, cost, task) {
    return this.track('ai', 'usage', { model, tokens, cost, task });
  }

  /**
   * Track conversion
   */
  trackConversion(type, value, currency = 'IRR') {
    return this.track('conversion', type, { value, currency });
  }

  /**
   * Get analytics summary
   */
  getSummary(filter = {}) {
    let events = [...this.events];
    if (filter.category) events = events.filter(e => e.category === filter.category);
    if (filter.since) events = events.filter(e => new Date(e.timestamp) >= new Date(filter.since));

    const byCategory = {};
    const byAction = {};
    for (const e of events) {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
      byAction[e.action] = (byAction[e.action] || 0) + 1;
    }

    return { total: events.length, byCategory, byAction };
  }

  _sanitize(obj) {
    const sanitized = { ...obj };
    delete sanitized.email;
    delete sanitized.phone;
    delete sanitized.name;
    delete sanitized.ip;
    delete sanitized.userId;
    return sanitized;
  }

  _hash(str) {
    if (!str) return 'anonymous';
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(String(str)).digest('hex').slice(0, 12);
  }
}

module.exports = { AnalyticsAdapter };
