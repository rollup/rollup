'use strict';

var ___baseClamp_js = require('./_baseClamp.js');
var __toNumber_js = require('./toNumber.js');

/**
 * Clamps `number` within the inclusive `lower` and `upper` bounds.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Number
 * @param {number} number The number to clamp.
 * @param {number} [lower] The lower bound.
 * @param {number} upper The upper bound.
 * @returns {number} Returns the clamped number.
 * @example
 *
 * _.clamp(-10, -5, 5);
 * // => -5
 *
 * _.clamp(10, -5, 5);
 * // => 5
 */
function clamp(number, lower, upper) {
  if (upper === undefined) {
    upper = lower;
    lower = undefined;
  }
  if (upper !== undefined) {
    upper = __toNumber_js.default(upper);
    upper = upper === upper ? upper : 0;
  }
  if (lower !== undefined) {
    lower = __toNumber_js.default(lower);
    lower = lower === lower ? lower : 0;
  }
  return ___baseClamp_js.default(__toNumber_js.default(number), lower, upper);
}

module.exports = clamp;
