define(['./_baseSlice.js', './_isIterateeCall.js', './toInteger.js'], function (___baseSlice_js, ___isIterateeCall_js, __toInteger_js) { 'use strict';

  /**
   * Creates a slice of `array` from `start` up to, but not including, `end`.
   *
   * **Note:** This method is used instead of
   * [`Array#slice`](https://mdn.io/Array/slice) to ensure dense arrays are
   * returned.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Array
   * @param {Array} array The array to slice.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the slice of `array`.
   */
  function slice(array, start, end) {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return [];
    }
    if (end && typeof end != 'number' && ___isIterateeCall_js.default(array, start, end)) {
      start = 0;
      end = length;
    }
    else {
      start = start == null ? 0 : __toInteger_js.default(start);
      end = end === undefined ? length : __toInteger_js.default(end);
    }
    return ___baseSlice_js.default(array, start, end);
  }

  return slice;

});
