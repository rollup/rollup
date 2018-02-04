define(['./_baseMean.js', './identity.js'], function (___baseMean_js, __identity_js) { 'use strict';

  /**
   * Computes the mean of the values in `array`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Math
   * @param {Array} array The array to iterate over.
   * @returns {number} Returns the mean.
   * @example
   *
   * _.mean([4, 2, 8, 6]);
   * // => 5
   */
  function mean(array) {
    return ___baseMean_js.default(array, __identity_js.default);
  }

  return mean;

});
