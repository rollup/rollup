define(['./_arraySampleSize.js', './_baseSampleSize.js', './isArray.js', './_isIterateeCall.js', './toInteger.js'], function (___arraySampleSize_js, ___baseSampleSize_js, __isArray_js, ___isIterateeCall_js, __toInteger_js) { 'use strict';

  /**
   * Gets `n` random elements at unique keys from `collection` up to the
   * size of `collection`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Collection
   * @param {Array|Object} collection The collection to sample.
   * @param {number} [n=1] The number of elements to sample.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Array} Returns the random elements.
   * @example
   *
   * _.sampleSize([1, 2, 3], 2);
   * // => [3, 1]
   *
   * _.sampleSize([1, 2, 3], 4);
   * // => [2, 3, 1]
   */
  function sampleSize(collection, n, guard) {
    if ((guard ? ___isIterateeCall_js.default(collection, n, guard) : n === undefined)) {
      n = 1;
    } else {
      n = __toInteger_js.default(n);
    }
    var func = __isArray_js.default(collection) ? ___arraySampleSize_js.default : ___baseSampleSize_js.default;
    return func(collection, n);
  }

  return sampleSize;

});
