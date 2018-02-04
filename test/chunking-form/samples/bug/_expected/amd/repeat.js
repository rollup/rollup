define(['./_baseRepeat.js', './_isIterateeCall.js', './toInteger.js', './toString.js'], function (___baseRepeat_js, ___isIterateeCall_js, __toInteger_js, __toString_js) { 'use strict';

  /**
   * Repeats the given string `n` times.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category String
   * @param {string} [string=''] The string to repeat.
   * @param {number} [n=1] The number of times to repeat the string.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {string} Returns the repeated string.
   * @example
   *
   * _.repeat('*', 3);
   * // => '***'
   *
   * _.repeat('abc', 2);
   * // => 'abcabc'
   *
   * _.repeat('abc', 0);
   * // => ''
   */
  function repeat(string, n, guard) {
    if ((guard ? ___isIterateeCall_js.default(string, n, guard) : n === undefined)) {
      n = 1;
    } else {
      n = __toInteger_js.default(n);
    }
    return ___baseRepeat_js.default(__toString_js.default(string), n);
  }

  return repeat;

});
