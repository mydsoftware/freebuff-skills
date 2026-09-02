/**
 * @myd/i18n
 * Persian localization, RTL support, Jalali calendar, Toman currency.
 */

const { JalaliDate } = require('./jalali');
const { TomanCurrency } = require('./currency');
const { RTL } = require('./rtl');
const { PersianNumbers } = require('./numbers');

class MydI18n {
  constructor(config = {}) {
    this.locale = config.locale || 'fa-IR';
    this.jalali = new JalaliDate();
    this.currency = new TomanCurrency();
    this.rtl = new RTL();
    this.numbers = new PersianNumbers();
    this.translations = new Map();
    this._loadDefaults();
  }

  _loadDefaults() {
    // Common translations
    this.translations.set('fa-IR', {
      // Navigation
      'nav.home': 'خانه',
      'nav.dashboard': 'داشبورد',
      'nav.settings': 'تنظیمات',
      'nav.logout': 'خروج',
      'nav.login': 'ورود',
      'nav.profile': 'پروفایل',

      // Common actions
      'action.save': 'ذخیره',
      'action.cancel': 'لغو',
      'action.delete': 'حذف',
      'action.edit': 'ویرایش',
      'action.add': 'افزودن',
      'action.search': 'جستجو',
      'action.filter': 'فیلتر',
      'action.export': 'خروجی',
      'action.import': 'ورودی',
      'action.submit': 'ارسال',
      'action.confirm': 'تأیید',
      'action.close': 'بستن',
      'action.back': 'بازگشت',
      'action.next': 'بعدی',
      'action.previous': 'قبلی',
      'action.loading': 'در حال بارگذاری...',
      'action.saving': 'در حال ذخیره...',

      // Status
      'status.active': 'فعال',
      'status.inactive': 'غیرفعال',
      'status.pending': 'در انتظار',
      'status.completed': 'تکمیل شده',
      'status.failed': 'ناموفق',
      'status.error': 'خطا',

      // Time
      'time.today': 'امروز',
      'time.yesterday': 'دیروز',
      'time.tomorrow': 'فردا',
      'time.thisWeek': 'این هفته',
      'time.thisMonth': 'این ماه',
      'time.thisYear': 'امسال',

      // Messages
      'msg.noData': 'داده‌ای موجود نیست',
      'msg.confirmDelete': 'آیا از حذف این مورد اطمینان دارید؟',
      'msg.saveSuccess': 'با موفقیت ذخیره شد',
      'msg.saveError': 'خطا در ذخیره‌سازی',
      'msg.networkError': 'خطا در اتصال به شبکه',

      // Pagination
      'pagination.page': 'صفحه',
      'pagination.of': 'از',
      'pagination.items': 'آیتم',
      'pagination.first': 'اول',
      'pagination.last': 'آخر',
    });
  }

  /**
   * Translate a key
   * @param {string} key
   * @param {object} [params] - Interpolation params
   * @returns {string}
   */
  t(key, params = {}) {
    const localeTranslations = this.translations.get(this.locale) || {};
    let text = localeTranslations[key] || key;

    for (const [k, v] of Object.entries(params)) {
      text = text.replace(new RegExp(`{{${k}}}`, 'g'), String(v));
    }

    return text;
  }

  /**
   * Register translations for a locale
   */
  registerLocale(locale, translations) {
    this.translations.set(locale, { ...(this.translations.get(locale) || {}), ...translations });
  }

  /**
   * Format a Date as Jalali
   */
  formatJalali(date, format = 'YYYY/MM/DD') {
    return this.jalali.format(date, format);
  }

  /**
   * Format a number as Toman
   */
  formatToman(amount, showCurrency = true) {
    return this.currency.format(amount, showCurrency);
  }

  /**
   * Convert to Persian numbers
   */
  toPersianNumbers(str) {
    return this.numbers.toPersian(str);
  }

  /**
   * Get RTL direction attributes
   */
  getRTLAttrs() {
    return this.rtl.getAttributes();
  }

  /**
   * Get CSS class for RTL
   */
  getRTLCssClass() {
    return this.rtl.getCssClass();
  }
}

module.exports = { MydI18n, JalaliDate, TomanCurrency, RTL, PersianNumbers };
