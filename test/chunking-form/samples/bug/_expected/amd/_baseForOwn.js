define(['./_baseFor.js', './keys.js'], function (___baseFor_js, __keys_js) { 'use strict';

  /**
   * The base implementation of `_.forOwn` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwn(object, iteratee) {
    return object && ___baseFor_js.default(object, iteratee, __keys_js.default);
  }

  return baseForOwn;

});
