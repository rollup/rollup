'use strict';

var ___baseGetTag_js = require('./_baseGetTag.js');
var __isObjectLike_js = require('./isObjectLike.js');

/** `Object#toString` result references. */
var regexpTag = '[object RegExp]';

/**
 * The base implementation of `_.isRegExp` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
 */
function baseIsRegExp(value) {
  return __isObjectLike_js.default(value) && ___baseGetTag_js.default(value) == regexpTag;
}

module.exports = baseIsRegExp;
