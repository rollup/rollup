define(['./_baseExtremum.js', './_baseGt.js', './identity.js'], function (___baseExtremum_js, ___baseGt_js, __identity_js) { 'use strict';

  /**
   * Computes the maximum value of `array`. If `array` is empty or falsey,
   * `undefined` is returned.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Math
   * @param {Array} array The array to iterate over.
   * @returns {*} Returns the maximum value.
   * @example
   *
   * _.max([4, 2, 8, 6]);
   * // => 8
   *
   * _.max([]);
   * // => undefined
   */
  function max(array) {
    return (array && array.length)
      ? ___baseExtremum_js.default(array, __identity_js.default, ___baseGt_js.default)
      : undefined;
  }

  return max;

});
