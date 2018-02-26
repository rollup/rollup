'use strict';

var ___baseMatches_js = require('./_baseMatches.js');
var ___baseMatchesProperty_js = require('./_baseMatchesProperty.js');
var __identity_js = require('./identity.js');
var __isArray_js = require('./isArray.js');
var __property_js = require('./property.js');

/**
 * The base implementation of `_.iteratee`.
 *
 * @private
 * @param {*} [value=_.identity] The value to convert to an iteratee.
 * @returns {Function} Returns the iteratee.
 */
function baseIteratee(value) {
  // Don't store the `typeof` result in a variable to avoid a JIT bug in Safari 9.
  // See https://bugs.webkit.org/show_bug.cgi?id=156034 for more details.
  if (typeof value == 'function') {
    return value;
  }
  if (value == null) {
    return __identity_js.default;
  }
  if (typeof value == 'object') {
    return __isArray_js.default(value)
      ? ___baseMatchesProperty_js.default(value[0], value[1])
      : ___baseMatches_js.default(value);
  }
  return __property_js.default(value);
}

module.exports = baseIteratee;
