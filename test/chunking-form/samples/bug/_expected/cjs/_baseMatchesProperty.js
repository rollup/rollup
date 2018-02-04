'use strict';

var ___baseIsEqual_js = require('./_baseIsEqual.js');
var __get_js = require('./get.js');
var __hasIn_js = require('./hasIn.js');
var ___isKey_js = require('./_isKey.js');
var ___isStrictComparable_js = require('./_isStrictComparable.js');
var ___matchesStrictComparable_js = require('./_matchesStrictComparable.js');
var ___toKey_js = require('./_toKey.js');

/** Used to compose bitmasks for value comparisons. */
var COMPARE_PARTIAL_FLAG = 1,
    COMPARE_UNORDERED_FLAG = 2;

/**
 * The base implementation of `_.matchesProperty` which doesn't clone `srcValue`.
 *
 * @private
 * @param {string} path The path of the property to get.
 * @param {*} srcValue The value to match.
 * @returns {Function} Returns the new spec function.
 */
function baseMatchesProperty(path, srcValue) {
  if (___isKey_js.default(path) && ___isStrictComparable_js.default(srcValue)) {
    return ___matchesStrictComparable_js.default(___toKey_js.default(path), srcValue);
  }
  return function(object) {
    var objValue = __get_js.default(object, path);
    return (objValue === undefined && objValue === srcValue)
      ? __hasIn_js.default(object, path)
      : ___baseIsEqual_js.default(srcValue, objValue, COMPARE_PARTIAL_FLAG | COMPARE_UNORDERED_FLAG);
  };
}

module.exports = baseMatchesProperty;
