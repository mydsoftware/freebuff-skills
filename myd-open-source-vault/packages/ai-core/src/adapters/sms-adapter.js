/**
 * SmsAdapter — Abstraction layer for SMS providers.
 * Supports Iranian providers (Kavenegar, Melipayamak, Ghasedak).
 */

class SmsAdapter {
  constructor(config = {}) {
    this.provider = config.provider || 'kavenegar';
    this.config = config;
  }

  /**
   * Send an SMS
   * @param {object} params
   * @returns {Promise<{sent: boolean, messageId?: string}>}
   */
  async send({ to, message, sender, template, templateParams }) {
    switch (this.provider) {
      case 'kavenegar':
        return this._sendKavenegar({ to, message, sender, template, templateParams });
      case 'melipayamak':
        return this._sendMelipayamak({ to, message, sender });
      case 'ghasedak':
        return this._sendGhasedak({ to, message, sender });
      default:
        return { sent: false, error: `Unknown SMS provider: ${this.provider}` };
    }
  }

  async _sendKavenegar({ to, message, sender, template, templateParams }) {
    // Kavenegar API structure
    return {
      sent: false,
      gateway: 'kavenegar',
      status: 'not_configured',
      _api: {
        endpoint: `https://api.kavenegar.com/v1/${this.config.apiKey}/sms/send.json`,
        method: 'POST',
        body: {
          receptor: to,
          message: template ? undefined : message,
          sender: sender || this.config.sender,
          template: template,
          token: templateParams ? templateParams.token : undefined,
          token2: templateParams ? templateParams.token2 : undefined,
          type: 'sms',
        }
      }
    };
  }

  async _sendMelipayamak({ to, message, sender }) {
    return {
      sent: false,
      gateway: 'melipayamak',
      status: 'not_configured',
      _api: {
        endpoint: 'https://api.payamak-panel.com/post/Send.asmx/SendSMS',
        method: 'POST',
        body: { username: this.config.username, password: this.config.password, from: sender || this.config.sender, to, text: message }
      }
    };
  }

  async _sendGhasedak({ to, message, sender }) {
    return {
      sent: false,
      gateway: 'ghasedak',
      status: 'not_configured',
      _api: {
        endpoint: 'https://ghasedakapi.com/v2/sms/send/simple',
        method: 'POST',
        body: { receptor: to, message, sendernumber: sender || this.config.sender, type: 1 }
      }
    };
  }

  /**
   * Send verification code
   */
  async sendVerificationCode(to, code, templateName = 'verification') {
    return this.send({
      to,
      template: templateName,
      templateParams: { token: String(code) },
    });
  }

  /**
   * Send order notification
   */
  async sendOrderNotification(to, orderId, status) {
    return this.send({
      to,
      template: 'order_status',
      templateParams: { orderId, status },
    });
  }

  static getSupportedProviders() {
    return ['kavenegar', 'melipayamak', 'ghasedak', 'generic'];
  }
}

module.exports = { SmsAdapter };
