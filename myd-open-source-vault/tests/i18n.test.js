const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { MydI18n, JalaliDate, TomanCurrency, RTL, PersianNumbers } = require('../packages/i18n/src/index');

describe('MYD i18n', () => {
  describe('JalaliDate', () => {
    it('should convert Gregorian to Jalali', () => {
      const jalali = new JalaliDate();
      const result = jalali.toJalali(new Date(2024, 0, 1)); // Jan 1, 2024
      assert.ok(result.year >= 1402 && result.year <= 1403);
      assert.ok(result.month >= 1 && result.month <= 12);
      assert.ok(result.day >= 1 && result.day <= 31);
      assert.ok(result.monthName);
    });

    it('should format Jalali date', () => {
      const jalali = new JalaliDate();
      const formatted = jalali.format(new Date(2024, 0, 1), 'YYYY/MM/DD');
      assert.ok(formatted.includes('/'));
    });

    it('should get today', () => {
      const jalali = new JalaliDate();
      const today = jalali.today('YYYY/MM/DD');
      assert.ok(today);
    });

    it('should get month names', () => {
      const jalali = new JalaliDate();
      const names = jalali.getMonthNames();
      assert.equal(names.length, 12);
      assert.equal(names[0], 'فروردین');
    });

    it('should get day names', () => {
      const jalali = new JalaliDate();
      const names = jalali.getDayNames();
      assert.equal(names.length, 7);
      assert.equal(names[6], 'جمعه');
    });
  });

  describe('TomanCurrency', () => {
    it('should format amount', () => {
      const currency = new TomanCurrency();
      const formatted = currency.format(1500000);
      assert.ok(formatted.includes('تومان'));
    });

    it('should convert Rial to Toman', () => {
      const currency = new TomanCurrency();
      assert.equal(currency.rialToToman(10000), 1000);
    });

    it('should convert Toman to Rial', () => {
      const currency = new TomanCurrency();
      assert.equal(currency.tomanToRial(1000), 10000);
    });

    it('should format without currency name', () => {
      const currency = new TomanCurrency();
      const formatted = currency.format(500000, false);
      assert.ok(!formatted.includes('تومان'));
    });
  });

  describe('RTL', () => {
    it('should get RTL attributes', () => {
      const rtl = new RTL();
      const attrs = rtl.getAttributes();
      assert.equal(attrs.dir, 'rtl');
      assert.equal(attrs.lang, 'fa');
    });

    it('should get CSS class', () => {
      const rtl = new RTL();
      assert.equal(rtl.getCssClass(), 'rtl');
    });

    it('should generate CSS', () => {
      const rtl = new RTL();
      const css = rtl.generateCss();
      assert.ok(css.includes('direction: rtl'));
      assert.ok(css.includes('Vazirmatn'));
    });

    it('should flip properties', () => {
      const rtl = new RTL();
      assert.equal(rtl.flipProperty('margin-left'), 'margin-right');
      assert.equal(rtl.flipProperty('text-align: left'), 'text-align: right');
    });
  });

  describe('PersianNumbers', () => {
    it('should convert English to Persian digits', () => {
      const pn = new PersianNumbers();
      assert.equal(pn.toPersian('12345'), '۱۲۳۴۵');
    });

    it('should convert Persian to English digits', () => {
      const pn = new PersianNumbers();
      assert.equal(pn.toEnglish('۱۲۳۴۵'), '12345');
    });

    it('should format with commas', () => {
      const pn = new PersianNumbers();
      const formatted = pn.format(1500000);
      assert.ok(formatted.length > 0);
    });

    it('should format percentage', () => {
      const pn = new PersianNumbers();
      const pct = pn.formatPercent(42.5);
      assert.ok(pct.includes('%'));
    });
  });

  describe('MydI18n', () => {
    it('should translate keys', () => {
      const i18n = new MydI18n();
      assert.equal(i18n.t('nav.home'), 'خانه');
      assert.equal(i18n.t('action.save'), 'ذخیره');
    });

    it('should handle missing keys', () => {
      const i18n = new MydI18n();
      assert.equal(i18n.t('nonexistent.key'), 'nonexistent.key');
    });

    it('should format Jalali date', () => {
      const i18n = new MydI18n();
      const formatted = i18n.formatJalali(new Date(2024, 0, 1));
      assert.ok(formatted.includes('/'));
    });

    it('should format Toman', () => {
      const i18n = new MydI18n();
      const formatted = i18n.formatToman(1000000);
      assert.ok(formatted.includes('تومان'));
    });

    it('should convert to Persian numbers', () => {
      const i18n = new MydI18n();
      assert.equal(i18n.toPersianNumbers('42'), '۴۲');
    });

    it('should get RTL attributes', () => {
      const i18n = new MydI18n();
      const attrs = i18n.getRTLAttrs();
      assert.equal(attrs.dir, 'rtl');
    });

    it('should register custom locale', () => {
      const i18n = new MydI18n();
      i18n.registerLocale('en-US', { 'nav.home': 'Home' });
      i18n.locale = 'en-US';
      assert.equal(i18n.t('nav.home'), 'Home');
    });

    it('should support parameter interpolation', () => {
      const i18n = new MydI18n();
      i18n.registerLocale('fa-IR', { 'greeting': 'سلام {{name}}' });
      assert.equal(i18n.t('greeting', { name: 'علی' }), 'سلام علی');
    });
  });
});
