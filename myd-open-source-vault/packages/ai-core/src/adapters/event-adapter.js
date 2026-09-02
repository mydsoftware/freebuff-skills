/**
 * EventAdapter — Event bus for the MYD ecosystem.
 * Supports in-memory, Redis, and webhook-based event distribution.
 */

const EventEmitter = require('events');

// Standard MYD events
const MYD_EVENTS = {
  // User events
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',

  // Commerce events
  ORDER_CREATED: 'order.created',
  ORDER_UPDATED: 'order.updated',
  ORDER_COMPLETED: 'order.completed',
  ORDER_CANCELLED: 'order.cancelled',

  // Payment events
  PAYMENT_CREATED: 'payment.created',
  PAYMENT_COMPLETED: 'payment.completed',
  PAYMENT_FAILED: 'payment.failed',
  PAYMENT_REFUNDED: 'payment.refunded',

  // Agent events
  AGENT_STARTED: 'agent.started',
  AGENT_COMPLETED: 'agent.completed',
  AGENT_FAILED: 'agent.failed',

  // Product events
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',

  // Deployment events
  DEPLOYMENT_STARTED: 'deployment.started',
  DEPLOYMENT_COMPLETED: 'deployment.completed',
  DEPLOYMENT_FAILED: 'deployment.failed',

  // License events
  LICENSE_CHECKED: 'license.checked',
  LICENSE_ALERT: 'license.alert',

  // Security events
  SECURITY_SCAN_COMPLETED: 'security.scan.completed',
  SECURITY_ISSUE_FOUND: 'security.issue.found',

  // Custom
  CUSTOM: 'custom',
};

class EventAdapter extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = config;
    this.maxListeners = config.maxListeners || 100;
    this.setMaxListeners(this.maxListeners);
    this._log = [];
  }

  /**
   * Emit a MYD event with structured data
   * @param {string} eventType
   * @param {object} data
   */
  emitEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      data,
      timestamp: new Date().toISOString(),
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    };

    // Log the event
    this._log.push(event);
    if (this._log.length > 1000) this._log = this._log.slice(-500);

    // Emit to listeners
    this.emit(eventType, event);
    this.emit('*', event); // Wildcard listener

    return event;
  }

  /**
   * Subscribe to an event type
   */
  onEvent(eventType, handler) {
    this.on(eventType, handler);
    return () => this.off(eventType, handler);
  }

  /**
   * Get event log
   */
  getLog(filter = {}) {
    let events = [...this._log];
    if (filter.type) events = events.filter(e => e.type === filter.type);
    if (filter.since) events = events.filter(e => new Date(e.timestamp) >= new Date(filter.since));
    if (filter.limit) events = events.slice(-filter.limit);
    return events;
  }

  /**
   * Get event statistics
   */
  getStats() {
    const byType = {};
    for (const event of this._log) {
      byType[event.type] = (byType[event.type] || 0) + 1;
    }
    return { total: this._log.length, byType };
  }

  static get MYD_EVENTS() { return MYD_EVENTS; }
}

module.exports = { EventAdapter, MYD_EVENTS };
