'use strict';

var ___getTag_js = require('./_getTag.js');
var __isObjectLike_js = require('./isObjectLike.js');

/** `Object#toString` result references. */
var setTag = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return __isObjectLike_js.default(value) && ___getTag_js.default(value) == setTag;
}

module.exports = baseIsSet;
