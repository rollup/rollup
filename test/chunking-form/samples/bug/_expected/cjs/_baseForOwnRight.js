'use strict';

var ___baseForRight_js = require('./_baseForRight.js');
var __keys_js = require('./keys.js');

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

module.exports = baseForOwnRight;
