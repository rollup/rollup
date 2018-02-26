define(['./_baseRandom.js'], function (___baseRandom_js) { 'use strict';

  /**
   * A specialized version of `_.sample` for arrays.
   *
   * @private
   * @param {Array} array The array to sample.
   * @returns {*} Returns the random element.
   */
  function arraySample(array) {
    var length = array.length;
    return length ? array[___baseRandom_js.default(0, length - 1)] : undefined;
  }

  return arraySample;

});
