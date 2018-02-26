'use strict';

var ___baseExtremum_js = require('./_baseExtremum.js');
var ___baseLt_js = require('./_baseLt.js');
var __identity_js = require('./identity.js');

/**
 * Computes the minimum value of `array`. If `array` is empty or falsey,
 * `undefined` is returned.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Math
 * @param {Array} array The array to iterate over.
 * @returns {*} Returns the minimum value.
 * @example
 *
 * _.min([4, 2, 8, 6]);
 * // => 2
 *
 * _.min([]);
 * // => undefined
 */
function min(array) {
  return (array && array.length)
    ? ___baseExtremum_js.default(array, __identity_js.default, ___baseLt_js.default)
    : undefined;
}

module.exports = min;
