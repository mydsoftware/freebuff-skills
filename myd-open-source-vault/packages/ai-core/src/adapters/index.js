/**
 * MYD Adapter Layer
 * Pluggable adapters for payments, SMS, authentication, events, analytics.
 * No upstream project should be modified directly — everything goes through adapters.
 */

const { PaymentAdapter } = require('./payment-adapter');
const { SmsAdapter } = require('./sms-adapter');
const { AuthAdapter } = require('./auth-adapter');
const { EventAdapter } = require('./event-adapter');
const { AnalyticsAdapter } = require('./analytics-adapter');
const { DatabaseAdapter } = require('./database-adapter');

module.exports = {
  PaymentAdapter,
  SmsAdapter,
  AuthAdapter,
  EventAdapter,
  AnalyticsAdapter,
  DatabaseAdapter,
};
