define(['./_baseEach.js'], function (___baseEach_js) { 'use strict';

  /**
   * The base implementation of `_.some` without support for iteratee shorthands.
   *
   * @private
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */
  function baseSome(collection, predicate) {
    var result;

    ___baseEach_js.default(collection, function(value, index, collection) {
      result = predicate(value, index, collection);
      return !result;
    });
    return !!result;
  }

  return baseSome;

});
