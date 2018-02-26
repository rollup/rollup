'use strict';

var ___baseIsEqualDeep_js = require('./_baseIsEqualDeep.js');
var __isObjectLike_js = require('./isObjectLike.js');

/**
 * The base implementation of `_.isEqual` which supports partial comparisons
 * and tracks traversed objects.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Unordered comparison
 *  2 - Partial comparison
 * @param {Function} [customizer] The function to customize comparisons.
 * @param {Object} [stack] Tracks traversed `value` and `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, bitmask, customizer, stack) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!__isObjectLike_js.default(value) && !__isObjectLike_js.default(other))) {
    return value !== value && other !== other;
  }
  return ___baseIsEqualDeep_js.default(value, other, bitmask, customizer, baseIsEqual, stack);
}

module.exports = baseIsEqual;
