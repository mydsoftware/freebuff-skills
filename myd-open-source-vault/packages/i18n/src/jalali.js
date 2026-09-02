/**
 * JalaliDate — Jalali (Persian/Solar Hijri) calendar conversion and formatting.
 * Based on the Iranian calendar algorithm.
 */

class JalaliDate {
  /**
   * Convert Gregorian date to Jalali
   * @param {Date} date
   * @returns {{year: number, month: number, day: number, monthName: string}}
   */
  toJalali(date) {
    const d = date instanceof Date ? date : new Date(date);
    const gd = d.getDate();
    const gm = d.getMonth() + 1;
    const gy = d.getFullYear();

    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    let gy2 = (gm > 2) ? (gy + 1) : gy;
    let days = 355666 + (365 * gy) + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100)
      + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
    let jy = -1595 + (33 * Math.floor(days / 12053));
    days %= 12053;
    jy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      jy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    let jm, jd;
    if (days < 186) {
      jm = 1 + Math.floor(days / 31);
      jd = 1 + (days % 31);
    } else {
      jm = 7 + Math.floor((days - 186) / 30);
      jd = 1 + ((days - 186) % 30);
    }

    const monthNames = [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];

    return { year: jy, month: jm, day: jd, monthName: monthNames[jm - 1] };
  }

  /**
   * Convert Jalali to Gregorian
   */
  toGregorian(jy, jm, jd) {
    const jy1 = jy - 979;
    const jm1 = jm - 1;
    const jd1 = jd - 1;
    const j_day_no = 365 * jy1 + Math.floor(jy1 / 33) * 8 + Math.floor(((jy1 % 33) + 3) / 4)
      + jd1 + ((jm1 < 7) ? (jm1) * 31 : ((jm1 - 7) * 30 + 186));
    const g_day_no = j_day_no + 79;
    let gy = 1600 + 400 * Math.floor(g_day_no / 146097);
    const gd = g_day_no % 146097;
    gy += 100 * Math.floor(gd / 36525);
    const g_d = gd % 36525;
    gy += Math.floor((g_d - 1) / 365);
    const g_yd = (g_d - 1) % 365;
    let gm;
    if (g_yd < 186) {
      gm = 1 + Math.floor(g_yd / 31);
    } else {
      gm = 7 + Math.floor((g_yd - 186) / 30);
    }
    const gd2 = (g_yd < 186)
      ? (g_yd % 31) + 1
      : ((g_yd - 186) % 30) + 1;

    return new Date(gy, gm - 1, gd2);
  }

  /**
   * Format a Jalali date
   */
  format(date, format = 'YYYY/MM/DD') {
    const j = this.toJalali(date);
    return format
      .replace('YYYY', String(j.year).padStart(4, '0'))
      .replace('MM', String(j.month).padStart(2, '0'))
      .replace('DD', String(j.day).padStart(2, '0'))
      .replace('MMMM', j.monthName)
      .replace('MMM', j.monthName.substring(0, 3))
      .replace('NN', String(j.month).padStart(2, '0'));
  }

  /**
   * Get today in Jalali
   */
  today(format) {
    return this.format(new Date(), format);
  }

  /**
   * Get month names
   */
  getMonthNames() {
    return [
      'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
      'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
    ];
  }

  /**
   * Get day of week names (Persian)
   */
  getDayNames() {
    return ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه'];
  }

  /**
   * Get days in a Jalali month
   */
  getDaysInMonth(year, month) {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    // Esfand — check for leap year
    return this.isLeapYear(year) ? 30 : 29;
  }

  /**
   * Check if a Jalali year is a leap year
   */
  isLeapYear(year) {
    const breaks = [
      -61, 9, 38, 199, 426, 686, 756, 1286, 1403, 1530,
      2078, 2141, 2299, 2475, 2548, 3139
    ];
    const bl = breaks.length;
    const jp = breaks[0];
    if (year < jp || year >= breaks[bl - 1]) {
      throw new Error(`Jalali year out of range: ${year}`);
    }
    for (let i = 1; i < bl; i++) {
      const jump = breaks[i] - breaks[i - 1];
      const nJump = breaks[i + 1 !== bl ? i + 1 : i] - breaks[i];
      if (breaks[i] <= year) {
        const yJump = year - breaks[i];
        if (jump === 33) {
          const mod = yJump % 33;
          return mod !== 0 && (mod + 1) % 4 === 0;
        } else {
          const mod = yJump % jump;
          return mod !== 0 && (mod + 1) % (jump > 6 ? 4 : 2) === 0;
        }
      }
    }
    return false;
  }
}

module.exports = { JalaliDate };
