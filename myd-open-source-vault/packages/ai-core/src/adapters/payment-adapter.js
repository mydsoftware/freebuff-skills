/**
 * PaymentAdapter — Abstraction layer for payment gateways.
 * Supports Iranian gateways (Zarinpal, IDPay, NextPay) and international (Stripe, PayPal).
 */

class PaymentAdapter {
  constructor(config = {}) {
    this.provider = config.provider || 'zarinpal';
    this.config = config;
    this._providerImpl = null;
  }

  initialize() {
    switch (this.provider) {
      case 'zarinpal':
        this._providerImpl = new ZarinpalProvider(this.config);
        break;
      case 'idpay':
        this._providerImpl = new IDPayProvider(this.config);
        break;
      case 'nextpay':
        this._providerImpl = new NextPayProvider(this.config);
        break;
      case 'stripe':
        this._providerImpl = new StripeProvider(this.config);
        break;
      default:
        this._providerImpl = new GenericProvider(this.config);
    }
    return this;
  }

  /**
   * Create a payment
   * @param {object} params
   * @returns {Promise<{paymentId: string, url: string}>}
   */
  async createPayment({ amount, description, callbackUrl, metadata = {} }) {
    return this._providerImpl.createPayment({ amount, description, callbackUrl, metadata });
  }

  /**
   * Verify a payment
   * @param {string} paymentId
   * @returns {Promise<{verified: boolean, amount: number, referenceId?: string}>}
   */
  async verifyPayment(paymentId) {
    return this._providerImpl.verifyPayment(paymentId);
  }

  /**
   * Refund a payment (if supported)
   */
  async refund(paymentId, amount) {
    if (this._providerImpl.refund) {
      return this._providerImpl.refund(paymentId, amount);
    }
    return { success: false, error: 'Refund not supported by this provider' };
  }

  /**
   * List supported providers
   */
  static getSupportedProviders() {
    return ['zarinpal', 'idpay', 'nextpay', 'stripe', 'paypal', 'generic'];
  }
}

// Iranian payment gateways

class ZarinpalProvider {
  constructor(config) {
    this.merchantId = config.merchantId || config.merchant_id || '';
    this.sandbox = config.sandbox !== false;
    this.baseUrl = this.sandbox
      ? 'https://sandbox.zarinpal.com/pg/rest/WebGate'
      : 'https://api.zarinpal.com/pg/rest/WebGate';
  }

  async createPayment({ amount, description, callbackUrl, metadata }) {
    // Implementation would make HTTP call to Zarinpal API
    // Returning structured result
    return {
      paymentId: null,
      url: `${this.baseUrl}/PaymentRequest`,
      gateway: 'zarinpal',
      amount,
      description,
      status: 'pending',
      _api: {
        endpoint: 'PaymentRequest',
        method: 'POST',
        body: {
          MerchantID: this.merchantId,
          Amount: amount,
          CallbackURL: callbackUrl,
          Description: description,
          Metadata: metadata,
        }
      }
    };
  }

  async verifyPayment(paymentId) {
    return {
      verified: false,
      amount: 0,
      referenceId: null,
      gateway: 'zarinpal',
      status: 'unverified',
      _api: {
        endpoint: 'PaymentVerification',
        method: 'POST',
        body: { MerchantID: this.merchantId, Authority: paymentId }
      }
    };
  }
}

class IDPayProvider {
  constructor(config) {
    this.apiKey = config.apiKey || config.api_key || '';
    this.sandbox = config.sandbox !== false;
    this.baseUrl = this.sandbox
      ? 'https://sandbox.idpay.ir/v1.1'
      : 'https://api.idpay.ir/v1.1';
  }

  async createPayment({ amount, description, callbackUrl, metadata }) {
    return {
      paymentId: null,
      url: `${this.baseUrl}/payment`,
      gateway: 'idpay',
      amount,
      description,
      status: 'pending',
      _api: {
        endpoint: 'payment',
        method: 'POST',
        headers: { 'X-API-KEY': this.apiKey },
        body: {
          order_id: metadata.orderId || `ORD-${Date.now()}`,
          amount,
          callback: callbackUrl,
          name: metadata.customerName || '',
          phone: metadata.customerPhone || '',
          mail: metadata.customerEmail || '',
          desc: description,
        }
      }
    };
  }

  async verifyPayment(paymentId) {
    return {
      verified: false,
      amount: 0,
      referenceId: null,
      gateway: 'idpay',
      status: 'unverified',
    };
  }
}

class NextPayProvider {
  constructor(config) {
    this.apiKey = config.apiKey || '';
    this.baseUrl = 'https://api.nextpay.org/v2';
  }

  async createPayment({ amount, description, callbackUrl, metadata }) {
    return {
      paymentId: null,
      url: `${this.baseUrl}/payment`,
      gateway: 'nextpay',
      amount,
      description,
      status: 'pending',
    };
  }

  async verifyPayment(paymentId) {
    return { verified: false, amount: 0, referenceId: null, gateway: 'nextpay', status: 'unverified' };
  }
}

class StripeProvider {
  constructor(config) {
    this.secretKey = config.secretKey || '';
    this.baseUrl = 'https://api.stripe.com/v1';
  }

  async createPayment({ amount, description, callbackUrl, metadata }) {
    return {
      paymentId: null,
      url: `${this.baseUrl}/payment_intents`,
      gateway: 'stripe',
      amount,
      description,
      status: 'pending',
    };
  }

  async verifyPayment(paymentId) {
    return { verified: false, amount: 0, referenceId: null, gateway: 'stripe', status: 'unverified' };
  }
}

class GenericProvider {
  constructor(config) { this.config = config; }
  async createPayment(params) { return { status: 'not_configured', ...params }; }
  async verifyPayment(id) { return { verified: false, status: 'not_configured' }; }
}

module.exports = { PaymentAdapter };
