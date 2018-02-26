define(['./_baseEach.js'], function (___baseEach_js) { 'use strict';

  /**
   * Aggregates elements of `collection` on `accumulator` with keys transformed
   * by `iteratee` and values set by `setter`.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} setter The function to set `accumulator` values.
   * @param {Function} iteratee The iteratee to transform keys.
   * @param {Object} accumulator The initial aggregated object.
   * @returns {Function} Returns `accumulator`.
   */
  function baseAggregator(collection, setter, iteratee, accumulator) {
    ___baseEach_js.default(collection, function(value, key, collection) {
      setter(accumulator, value, iteratee(value), collection);
    });
    return accumulator;
  }

  return baseAggregator;

});
