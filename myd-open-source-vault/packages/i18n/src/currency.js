/**
 * TomanCurrency — Format Iranian Toman/Rial currency.
 */

class TomanCurrency {
  constructor(config = {}) {
    this.currency = config.currency || 'تومان';
    this.subUnit = config.subUnit || 'ریال';
    this.ratio = config.ratio || 10; // 1 Toman = 10 Rial
  }

  /**
   * Format amount as Toman
   * @param {number} amount
   * @param {boolean} showCurrency
   * @returns {string}
   */
  format(amount, showCurrency = true) {
    const formatted = this._formatNumber(amount);
    return showCurrency ? `${formatted} ${this.currency}` : formatted;
  }

  /**
   * Convert Rial to Toman
   */
  rialToToman(rial) {
    return Math.round(rial / this.ratio);
  }

  /**
   * Convert Toman to Rial
   */
  tomanToRial(toman) {
    return toman * this.ratio;
  }

  /**
   * Format with commas (Iranian style uses ,)
   */
  _formatNumber(num) {
    if (typeof num !== 'number') num = parseFloat(num) || 0;
    return num.toLocaleString('fa-IR');
  }

  /**
   * Parse a formatted Toman string back to number
   */
  parse(str) {
    // Remove currency name and whitespace
    const cleaned = str.replace(new RegExp(this.currency, 'g'), '').replace(/\s/g, '').trim();
    // Convert Persian digits to English
    const english = this._toEnglishDigits(cleaned);
    return parseInt(english.replace(/,/g, ''), 10) || 0;
  }

  _toEnglishDigits(str) {
    const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    let result = str;
    persianDigits.forEach((pd, i) => {
      result = result.replace(new RegExp(pd, 'g'), String(i));
    });
    return result;
  }
}

module.exports = { TomanCurrency };
