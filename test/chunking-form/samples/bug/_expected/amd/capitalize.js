define(['./toString.js', './upperFirst.js'], function (__toString_js, __upperFirst_js) { 'use strict';

  /**
   * Converts the first character of `string` to upper case and the remaining
   * to lower case.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to capitalize.
   * @returns {string} Returns the capitalized string.
   * @example
   *
   * _.capitalize('FRED');
   * // => 'Fred'
   */
  function capitalize(string) {
    return __upperFirst_js.default(__toString_js.default(string).toLowerCase());
  }

  return capitalize;

});
