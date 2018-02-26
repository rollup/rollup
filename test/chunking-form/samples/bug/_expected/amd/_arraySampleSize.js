define(['./_baseClamp.js', './_copyArray.js', './_shuffleSelf.js'], function (___baseClamp_js, ___copyArray_js, ___shuffleSelf_js) { 'use strict';

  /**
   * A specialized version of `_.sampleSize` for arrays.
   *
   * @private
   * @param {Array} array The array to sample.
   * @param {number} n The number of elements to sample.
   * @returns {Array} Returns the random elements.
   */
  function arraySampleSize(array, n) {
    return ___shuffleSelf_js.default(___copyArray_js.default(array), ___baseClamp_js.default(n, 0, array.length));
  }

  return arraySampleSize;

});
