'use strict';

var ___baseForOwn_js = require('./_baseForOwn.js');
var ___createBaseEach_js = require('./_createBaseEach.js');

/**
 * The base implementation of `_.forEach` without support for iteratee shorthands.
 *
 * @private
 * @param {Array|Object} collection The collection to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array|Object} Returns `collection`.
 */
var baseEach = ___createBaseEach_js.default(___baseForOwn_js.default);

module.exports = baseEach;
