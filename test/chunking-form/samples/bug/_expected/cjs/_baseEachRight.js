'use strict';

var ___baseForOwnRight_js = require('./_baseForOwnRight.js');
var ___createBaseEach_js = require('./_createBaseEach.js');

/**
 * The base implementation of `_.forEachRight` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEachRight = ___createBaseEach_js.default(___baseForOwnRight_js.default, true);

module.exports = baseEachRight;
