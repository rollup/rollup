'use strict';

var ___baseRange_js = require('./_baseRange.js');
var ___isIterateeCall_js = require('./_isIterateeCall.js');
var __toFinite_js = require('./toFinite.js');

/**
 * Creates a `_.range` or `_.rangeRight` function.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new range function.
 */
function createRange(fromRight) {
  return function(start, end, step) {
    if (step && typeof step != 'number' && ___isIterateeCall_js.default(start, end, step)) {
      end = step = undefined;
    }
    // Ensure the sign of `-0` is preserved.
    start = __toFinite_js.default(start);
    if (end === undefined) {
      end = start;
      start = 0;
    } else {
      end = __toFinite_js.default(end);
    }
    step = step === undefined ? (start < end ? 1 : -1) : __toFinite_js.default(step);
    return ___baseRange_js.default(start, end, step, fromRight);
  };
}

module.exports = createRange;
