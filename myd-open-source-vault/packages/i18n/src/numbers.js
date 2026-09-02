/**
 * PersianNumbers — Convert between English and Persian digits.
 */

class PersianNumbers {
  constructor() {
    this.persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    this.englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  }

  /**
   * Convert English digits to Persian
   * @param {string|number} input
   * @returns {string}
   */
  toPersian(input) {
    let str = String(input);
    this.englishDigits.forEach((ed, i) => {
      str = str.replace(new RegExp(ed, 'g'), this.persianDigits[i]);
    });
    return str;
  }

  /**
   * Convert Persian digits to English
   * @param {string} input
   * @returns {string}
   */
  toEnglish(input) {
    let str = String(input);
    this.persianDigits.forEach((pd, i) => {
      str = str.replace(new RegExp(pd, 'g'), this.englishDigits[i]);
    });
    return str;
  }

  /**
   * Format a number with Persian digits and commas
   * @param {number} num
   * @returns {string}
   */
  format(num) {
    const withCommas = num.toLocaleString('en-US');
    return this.toPersian(withCommas);
  }

  /**
   * Format a percentage
   */
  formatPercent(num) {
    return `${this.toPersian(num.toFixed(1))}%`;
  }
}

module.exports = { PersianNumbers };
