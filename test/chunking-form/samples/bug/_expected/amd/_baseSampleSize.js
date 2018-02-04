define(['./_baseClamp.js', './_shuffleSelf.js', './values.js'], function (___baseClamp_js, ___shuffleSelf_js, __values_js) { 'use strict';

  /**
   * The base implementation of `_.sampleSize` without param guards.
   *
   * @private
   * @param {Array|Object} collection The collection to sample.
   * @param {number} n The number of elements to sample.
   * @returns {Array} Returns the random elements.
   */
  function baseSampleSize(collection, n) {
    var array = __values_js.default(collection);
    return ___shuffleSelf_js.default(array, ___baseClamp_js.default(n, 0, array.length));
  }

  return baseSampleSize;

});
