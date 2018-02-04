define(['./_baseFindIndex.js', './_baseIsNaN.js', './_strictIndexOf.js'], function (___baseFindIndex_js, ___baseIsNaN_js, ___strictIndexOf_js) { 'use strict';

  /**
   * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} value The value to search for.
   * @param {number} fromIndex The index to search from.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    return value === value
      ? ___strictIndexOf_js.default(array, value, fromIndex)
      : ___baseFindIndex_js.default(array, ___baseIsNaN_js.default, fromIndex);
  }

  return baseIndexOf;

});
