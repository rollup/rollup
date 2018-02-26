define(['./_baseSum.js'], function (___baseSum_js) { 'use strict';

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /**
   * The base implementation of `_.mean` and `_.meanBy` without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {number} Returns the mean.
   */
  function baseMean(array, iteratee) {
    var length = array == null ? 0 : array.length;
    return length ? (___baseSum_js.default(array, iteratee) / length) : NAN;
  }

  return baseMean;

});
