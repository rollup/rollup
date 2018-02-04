define(['./toInteger.js', './toLength.js'], function (__toInteger_js, __toLength_js) { 'use strict';

  /**
   * The base implementation of `_.fill` without an iteratee call guard.
   *
   * @private
   * @param {Array} array The array to fill.
   * @param {*} value The value to fill `array` with.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns `array`.
   */
  function baseFill(array, value, start, end) {
    var length = array.length;

    start = __toInteger_js.default(start);
    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = (end === undefined || end > length) ? length : __toInteger_js.default(end);
    if (end < 0) {
      end += length;
    }
    end = start > end ? 0 : __toLength_js.default(end);
    while (start < end) {
      array[start++] = value;
    }
    return array;
  }

  return baseFill;

});
