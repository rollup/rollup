define(['./_baseEach.js', './isArrayLike.js'], function (___baseEach_js, __isArrayLike_js) { 'use strict';

  /**
   * The base implementation of `_.map` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the new mapped array.
   */
  function baseMap(collection, iteratee) {
    var index = -1,
        result = __isArrayLike_js.default(collection) ? Array(collection.length) : [];

    ___baseEach_js.default(collection, function(value, key, collection) {
      result[++index] = iteratee(value, key, collection);
    });
    return result;
  }

  return baseMap;

});
