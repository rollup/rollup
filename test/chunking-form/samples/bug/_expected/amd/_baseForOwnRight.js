define(['./_baseForRight.js', './keys.js'], function (___baseForRight_js, __keys_js) { 'use strict';

  /**
   * The base implementation of `_.forOwnRight` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Object} Returns `object`.
   */
  function baseForOwnRight(object, iteratee) {
    return object && ___baseForRight_js.default(object, iteratee, __keys_js.default);
  }

  return baseForOwnRight;

});
