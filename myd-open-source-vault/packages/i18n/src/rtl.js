/**
 * RTL — Right-to-Left layout support for Persian/Arabic.
 */

class RTL {
  constructor() {
    this.isRTL = true;
    this.dir = 'rtl';
  }

  /**
   * Get HTML direction attributes
   */
  getAttributes() {
    return {
      dir: 'rtl',
      lang: 'fa',
      'xml:lang': 'fa',
    };
  }

  /**
   * Get CSS class name for RTL
   */
  getCssClass() {
    return 'rtl';
  }

  /**
   * Get CSS text direction
   */
  getTextDirection() {
    return 'direction: rtl; text-align: right;';
  }

  /**
   * Get margin/padding flip for RTL
   * Maps LTR left/right to RTL right/left
   */
  flipProperty(property) {
    const flips = {
      'margin-left': 'margin-right',
      'margin-right': 'margin-left',
      'padding-left': 'padding-right',
      'padding-right': 'padding-left',
      'border-left': 'border-right',
      'border-right': 'border-left',
      'text-align: left': 'text-align: right',
      'text-align: right': 'text-align: left',
      'float: left': 'float: right',
      'float: right': 'float: left',
      'left': 'right',
      'right': 'left',
    };
    return flips[property] || property;
  }

  /**
   * Get Tailwind RTL classes
   */
  getTailwindClasses() {
    return {
      direction: 'rtl',
      textRight: 'text-right',
      textLeft: 'text-left',
      marginLeft: 'mr-',
      marginRight: 'ml-',
      paddingLeft: 'pr-',
      paddingRight: 'pl-',
      borderLeft: 'border-r-',
      borderRight: 'border-l-',
      floatLeft: 'float-right',
      floatRight: 'float-left',
    };
  }

  /**
   * Generate RTL stylesheet
   */
  generateCss() {
    return `
/* MYD RTL Support */
[dir="rtl"], .rtl {
  direction: rtl;
  text-align: right;
}
[dir="rtl"] .flip-left-right {
  direction: ltr;
  text-align: left;
}
[dir="rtl"] .ms-auto { margin-right: auto; margin-left: 0; }
[dir="rtl"] .me-auto { margin-left: auto; margin-right: 0; }
[dir="rtl"] .ps-0 { padding-right: 0; padding-left: unset; }
[dir="rtl"] .pe-0 { padding-left: 0; padding-right: unset; }

/* Persian font */
@font-face {
  font-family: 'Vazirmatn';
  src: url('https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css');
}

body {
  font-family: 'Vazirmatn', 'Tahoma', 'Arial', sans-serif;
}
`;
  }
}

module.exports = { RTL };
