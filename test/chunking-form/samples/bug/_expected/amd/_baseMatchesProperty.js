define(['./_baseIsEqual.js', './get.js', './hasIn.js', './_isKey.js', './_isStrictComparable.js', './_matchesStrictComparable.js', './_toKey.js'], function (___baseIsEqual_js, __get_js, __hasIn_js, ___isKey_js, ___isStrictComparable_js, ___matchesStrictComparable_js, ___toKey_js) { 'use strict';

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

  return baseMatchesProperty;

});
