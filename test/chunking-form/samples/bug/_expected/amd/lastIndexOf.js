define(['./_baseFindIndex.js', './_baseIsNaN.js', './_strictLastIndexOf.js', './toInteger.js'], function (___baseFindIndex_js, ___baseIsNaN_js, ___strictLastIndexOf_js, __toInteger_js) { 'use strict';

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min;

  /**
   * This method is like `_.indexOf` except that it iterates over elements of
   * `array` from right to left.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Array
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=array.length-1] The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   * @example
   *
   * _.lastIndexOf([1, 2, 1, 2], 2);
   * // => 3
   *
   * // Search from the `fromIndex`.
   * _.lastIndexOf([1, 2, 1, 2], 2, 2);
   * // => 1
   */
  function lastIndexOf(array, value, fromIndex) {
    var length = array == null ? 0 : array.length;
    if (!length) {
      return -1;
    }
    var index = length;
    if (fromIndex !== undefined) {
      index = __toInteger_js.default(fromIndex);
      index = index < 0 ? nativeMax(length + index, 0) : nativeMin(index, length - 1);
    }
    return value === value
      ? ___strictLastIndexOf_js.default(array, value, index)
      : ___baseFindIndex_js.default(array, ___baseIsNaN_js.default, index, true);
  }

  return lastIndexOf;

});
