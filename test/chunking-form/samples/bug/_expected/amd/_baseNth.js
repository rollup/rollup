define(['./_isIndex.js'], function (___isIndex_js) { 'use strict';

  /**
   * The base implementation of `_.nth` which doesn't coerce arguments.
   *
   * @private
   * @param {Array} array The array to query.
   * @param {number} n The index of the element to return.
   * @returns {*} Returns the nth element of `array`.
   */
  function baseNth(array, n) {
    var length = array.length;
    if (!length) {
      return;
    }
    n += n < 0 ? length : 0;
    return ___isIndex_js.default(n, length) ? array[n] : undefined;
  }

  return baseNth;

});
