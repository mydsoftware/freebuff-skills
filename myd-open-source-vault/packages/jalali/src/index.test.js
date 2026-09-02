const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { Jalali, PERSIAN_MONTHS, PERSIAN_WEEKDAYS } = require('./index');

describe('@myd/jalali', () => {
  const j = new Jalali();

  describe('toJalali', () => {
    it('should convert known date (2024-01-01 → 1402-10-11)', () => {
      const result = j.toJalali(new Date(2024, 0, 1));
      assert.equal(result.year, 1402);
      assert.equal(result.month, 10);
      assert.equal(result.day, 11);
    });

    it('should convert Nowruz (2024-03-20 → 1403-01-01)', () => {
      const result = j.toJalali(new Date(2024, 2, 20));
      assert.equal(result.year, 1403);
      assert.equal(result.month, 1);
      assert.equal(result.day, 1);
    });

    it('should return correct month name', () => {
      const result = j.toJalali(new Date(2024, 0, 1));
      assert.equal(result.monthName, 'دی');
    });

    it('should return correct weekday', () => {
      // 2024-01-01 is Monday → Jalali weekday index 2 (دوشنبه)
      const result = j.toJalali(new Date(2024, 0, 1));
      assert.equal(result.weekday, 'دوشنبه');
      assert.equal(result.weekdayIndex, 2);
    });

    it('should convert a leap year date', () => {
      const result = j.toJalali(new Date(2024, 1, 29));
      assert.ok(result.year);
      assert.ok(result.month >= 1 && result.month <= 12);
    });
  });

  describe('toGregorian', () => {
    it('should convert 1403-01-01 → 2024-03-20', () => {
      const result = j.toGregorian(1403, 1, 1);
      assert.equal(result.getFullYear(), 2024);
      assert.equal(result.getMonth(), 2); // March (0-indexed)
      assert.equal(result.getDate(), 20);
    });

    it('should convert 1404-01-01 → 2025-03-20', () => {
      const result = j.toGregorian(1404, 1, 1);
      assert.equal(result.getFullYear(), 2025);
      assert.equal(result.getMonth(), 2);
      assert.equal(result.getDate(), 20);
    });

    it('should roundtrip: toGregorian(toJalali(date)) ≈ date', () => {
      const original = new Date(2024, 5, 15);
      const jalali = j.toJalali(original);
      const gregorian = j.toGregorian(jalali.year, jalali.month, jalali.day);
      assert.equal(gregorian.getFullYear(), original.getFullYear());
      assert.equal(gregorian.getMonth(), original.getMonth());
      assert.equal(gregorian.getDate(), original.getDate());
    });
  });

  describe('format', () => {
    it('should format YYYY/MM/DD', () => {
      const result = j.format(new Date(2024, 0, 1), 'YYYY/MM/DD');
      assert.equal(result, '1402/10/11');
    });

    it('should format full', () => {
      const result = j.format(new Date(2024, 0, 1), 'full');
      assert.ok(result.includes('۱۱') || result.includes('11'));
      assert.ok(result.includes('دی'));
      assert.ok(result.includes('۱۴۰۲') || result.includes('1402'));
    });

    it('should handle Jalali objects directly', () => {
      const result = j.format({ year: 1403, month: 1, day: 15 }, 'YYYY/MM/DD');
      assert.equal(result, '1403/01/15');
    });
  });

  describe('today', () => {
    it('should return today in YYYY/MM/DD', () => {
      const result = j.today();
      const parts = result.split('/');
      assert.equal(parts.length, 3);
      assert.ok(parseInt(parts[0]) >= 1400);
    });
  });

  describe('isLeapYear', () => {
    it('should identify 1406 as leap year', () => {
      assert.equal(j.isLeapYear(1406), true);
    });

    it('should identify 1403 as non-leap year', () => {
      assert.equal(j.isLeapYear(1403), false);
    });

    it('should identify 1410 as leap year', () => {
      assert.equal(j.isLeapYear(1410), true);
    });
  });

  describe('daysInMonth', () => {
    it('should return 31 for Farvardin', () => {
      assert.equal(j.daysInMonth(1403, 1), 31);
    });

    it('should return 30 for Mehr', () => {
      assert.equal(j.daysInMonth(1403, 7), 30);
    });

    it('should return 29 for Esfand in non-leap year', () => {
      assert.equal(j.daysInMonth(1403, 12), 29);
    });

    it('should return 30 for Esfand in leap year', () => {
      assert.equal(j.daysInMonth(1406, 12), 30);
    });
  });

  describe('addDays', () => {
    it('should add 1 day', () => {
      const result = j.addDays(1403, 1, 1, 1);
      assert.equal(result.month, 1);
      assert.equal(result.day, 2);
    });

    it('should cross month boundary', () => {
      const result = j.addDays(1403, 1, 31, 1);
      assert.equal(result.month, 2);
      assert.equal(result.day, 1);
    });
  });

  describe('diffDays', () => {
    it('should calculate difference', () => {
      const diff = j.diffDays(1403, 1, 1, 1403, 1, 10);
      assert.equal(diff, 9);
    });
  });

  describe('isValid', () => {
    it('should validate correct dates', () => {
      assert.equal(j.isValid(1403, 1, 15), true);
    });

    it('should reject invalid months', () => {
      assert.equal(j.isValid(1403, 13, 1), false);
      assert.equal(j.isValid(1403, 0, 1), false);
    });

    it('should reject invalid days', () => {
      assert.equal(j.isValid(1403, 1, 32), false);
      assert.equal(j.isValid(1403, 12, 30), false); // Non-leap year
    });
  });

  describe('toPersianNumber', () => {
    it('should convert digits', () => {
      assert.equal(j.toPersianNumber('123'), '۱۲۳');
      assert.equal(j.toPersianNumber('0'), '۰');
    });
  });

  describe('getSeason', () => {
    it('should return Spring for Farvardin', () => {
      assert.equal(j.getSeason(1).fa, 'بهار');
    });

    it('should return Winter for Esfand', () => {
      assert.equal(j.getSeason(12).fa, 'زمستان');
    });
  });

  describe('getQuarter', () => {
    it('should return correct quarters', () => {
      assert.equal(j.getQuarter(1), 1);
      assert.equal(j.getQuarter(4), 2);
      assert.equal(j.getQuarter(7), 3);
      assert.equal(j.getQuarter(10), 4);
    });
  });

  describe('range', () => {
    it('should generate date range', () => {
      const dates = j.range(1403, 1, 1, 5);
      assert.equal(dates.length, 5);
      assert.equal(dates[0].day, 1);
      assert.equal(dates[4].day, 5);
    });
  });

  describe('constants', () => {
    it('should have 12 month names', () => {
      assert.equal(PERSIAN_MONTHS.length, 12);
      assert.equal(PERSIAN_MONTHS[0], 'فروردین');
      assert.equal(PERSIAN_MONTHS[11], 'اسفند');
    });

    it('should have 7 weekday names', () => {
      assert.equal(PERSIAN_WEEKDAYS.length, 7);
      assert.equal(PERSIAN_WEEKDAYS[6], 'جمعه');
    });
  });
});
