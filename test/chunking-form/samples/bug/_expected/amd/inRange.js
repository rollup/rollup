define(['./_baseInRange.js', './toFinite.js', './toNumber.js'], function (___baseInRange_js, __toFinite_js, __toNumber_js) { 'use strict';

  /**
   * Checks if `n` is between `start` and up to, but not including, `end`. If
   * `end` is not specified, it's set to `start` with `start` then set to `0`.
   * If `start` is greater than `end` the params are swapped to support
   * negative ranges.
   *
   * @static
   * @memberOf _
   * @since 3.3.0
   * @category Number
   * @param {number} number The number to check.
   * @param {number} [start=0] The start of the range.
   * @param {number} end The end of the range.
   * @returns {boolean} Returns `true` if `number` is in the range, else `false`.
   * @see _.range, _.rangeRight
   * @example
   *
   * _.inRange(3, 2, 4);
   * // => true
   *
   * _.inRange(4, 8);
   * // => true
   *
   * _.inRange(4, 2);
   * // => false
   *
   * _.inRange(2, 2);
   * // => false
   *
   * _.inRange(1.2, 2);
   * // => true
   *
   * _.inRange(5.2, 4);
   * // => false
   *
   * _.inRange(-3, -2, -6);
   * // => true
   */
  function inRange(number, start, end) {
    start = __toFinite_js.default(start);
    if (end === undefined) {
      end = start;
      start = 0;
    } else {
      end = __toFinite_js.default(end);
    }
    number = __toNumber_js.default(number);
    return ___baseInRange_js.default(number, start, end);
  }

  return inRange;

});
