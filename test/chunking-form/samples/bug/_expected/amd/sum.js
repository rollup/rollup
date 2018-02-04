define(['./_baseSum.js', './identity.js'], function (___baseSum_js, __identity_js) { 'use strict';

  /**
   * Computes the sum of the values in `array`.
   *
   * @static
   * @memberOf _
   * @since 3.4.0
   * @category Math
   * @param {Array} array The array to iterate over.
   * @returns {number} Returns the sum.
   * @example
   *
   * _.sum([4, 2, 8, 6]);
   * // => 20
   */
  function sum(array) {
    return (array && array.length)
      ? ___baseSum_js.default(array, __identity_js.default)
      : 0;
  }

  return sum;

});
