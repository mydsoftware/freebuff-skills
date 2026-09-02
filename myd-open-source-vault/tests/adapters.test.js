const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { PaymentAdapter } = require('../packages/ai-core/src/adapters/payment-adapter');
const { SmsAdapter } = require('../packages/ai-core/src/adapters/sms-adapter');
const { AuthAdapter } = require('../packages/ai-core/src/adapters/auth-adapter');
const { EventAdapter, MYD_EVENTS } = require('../packages/ai-core/src/adapters/event-adapter');
const { AnalyticsAdapter } = require('../packages/ai-core/src/adapters/analytics-adapter');

describe('MYD Adapter Layer', () => {
  describe('PaymentAdapter', () => {
    it('should create a Zarinpal payment', async () => {
      const adapter = new PaymentAdapter({ provider: 'zarinpal', merchantId: 'test' });
      adapter.initialize();
      const result = await adapter.createPayment({
        amount: 100000,
        description: 'Test order',
        callbackUrl: 'https://example.com/callback',
      });
      assert.equal(result.gateway, 'zarinpal');
      assert.equal(result.amount, 100000);
      assert.equal(result.status, 'pending');
    });

    it('should create an IDPay payment', async () => {
      const adapter = new PaymentAdapter({ provider: 'idpay', apiKey: 'test' });
      adapter.initialize();
      const result = await adapter.createPayment({
        amount: 50000,
        description: 'Test',
        callbackUrl: 'https://example.com/cb',
      });
      assert.equal(result.gateway, 'idpay');
    });

    it('should list supported providers', () => {
      const providers = PaymentAdapter.getSupportedProviders();
      assert.ok(providers.includes('zarinpal'));
      assert.ok(providers.includes('idpay'));
      assert.ok(providers.includes('stripe'));
    });
  });

  describe('SmsAdapter', () => {
    it('should create Kavenegar SMS', async () => {
      const adapter = new SmsAdapter({ provider: 'kavenegar', apiKey: 'test', sender: '1000' });
      const result = await adapter.send({
        to: '09121234567',
        message: 'Test message',
      });
      assert.equal(result.gateway, 'kavenegar');
      assert.equal(result.status, 'not_configured');
    });

    it('should list supported providers', () => {
      const providers = SmsAdapter.getSupportedProviders();
      assert.ok(providers.includes('kavenegar'));
      assert.ok(providers.includes('melipayamak'));
    });
  });

  describe('AuthAdapter', () => {
    it('should hash and verify password', async () => {
      const adapter = new AuthAdapter();
      const { hash, salt } = await adapter.hashPassword('mypassword');
      assert.ok(hash);
      assert.ok(salt);
      const { verified } = await adapter.verifyPassword('mypassword', hash, salt);
      assert.equal(verified, true);
      const { verified: wrong } = await adapter.verifyPassword('wrongpassword', hash, salt);
      assert.equal(wrong, false);
    });

    it('should list supported providers', () => {
      const providers = AuthAdapter.getSupportedProviders();
      assert.ok(providers.includes('jwt'));
      assert.ok(providers.includes('keycloak'));
    });
  });

  describe('EventAdapter', () => {
    it('should emit and receive events', () => {
      const events = new EventAdapter();
      let received = null;
      events.onEvent('test.event', (e) => { received = e; });
      events.emitEvent('test.event', { message: 'hello' });
      assert.ok(received);
      assert.equal(received.type, 'test.event');
      assert.equal(received.data.message, 'hello');
    });

    it('should have standard MYD events', () => {
      assert.ok(MYD_EVENTS.ORDER_CREATED);
      assert.ok(MYD_EVENTS.PAYMENT_COMPLETED);
      assert.ok(MYD_EVENTS.AGENT_STARTED);
      assert.ok(MYD_EVENTS.DEPLOYMENT_FAILED);
    });

    it('should log events', () => {
      const events = new EventAdapter();
      events.emitEvent('a.b', { x: 1 });
      events.emitEvent('c.d', { y: 2 });
      const log = events.getLog();
      assert.equal(log.length, 2);
    });

    it('should get stats', () => {
      const events = new EventAdapter();
      events.emitEvent('user.created');
      events.emitEvent('user.created');
      events.emitEvent('order.created');
      const stats = events.getStats();
      assert.equal(stats.total, 3);
      assert.equal(stats.byType['user.created'], 2);
    });

    it('should support wildcard listeners', () => {
      const events = new EventAdapter();
      const all = [];
      events.on('*', (e) => all.push(e));
      events.emitEvent('a.b');
      events.emitEvent('c.d');
      assert.equal(all.length, 2);
    });
  });

  describe('AnalyticsAdapter', () => {
    it('should track events', () => {
      const analytics = new AnalyticsAdapter();
      analytics.track('page', 'view', { page: '/home' });
      const summary = analytics.getSummary();
      assert.equal(summary.total, 1);
    });

    it('should track AI usage', () => {
      const analytics = new AnalyticsAdapter();
      analytics.trackAIUsage('gpt-4o', 1000, 0.01, 'coding');
      const summary = analytics.getSummary({ category: 'ai' });
      assert.equal(summary.total, 1);
    });

    it('should sanitize PII in privacy mode', () => {
      const analytics = new AnalyticsAdapter({ privacyMode: true });
      analytics.track('test', 'action', { email: 'test@test.com', page: '/home' });
      const event = analytics.events[0];
      assert.ok(!event.properties.email);
      assert.equal(event.properties.page, '/home');
    });
  });
});
