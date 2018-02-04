define(['./_Symbol.js', './_arrayMap.js', './isArray.js', './isSymbol.js'], function (___Symbol_js, ___arrayMap_js, __isArray_js, __isSymbol_js) { 'use strict';

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0;

  /** Used to convert symbols to primitives and strings. */
  var symbolProto = ___Symbol_js.default ? ___Symbol_js.default.prototype : undefined,
      symbolToString = symbolProto ? symbolProto.toString : undefined;

  /**
   * The base implementation of `_.toString` which doesn't convert nullish
   * values to empty strings.
   *
   * @private
   * @param {*} value The value to process.
   * @returns {string} Returns the string.
   */
  function baseToString(value) {
    // Exit early for strings to avoid a performance hit in some environments.
    if (typeof value == 'string') {
      return value;
    }
    if (__isArray_js.default(value)) {
      // Recursively convert values (susceptible to call stack limits).
      return ___arrayMap_js.default(value, baseToString) + '';
    }
    if (__isSymbol_js.default(value)) {
      return symbolToString ? symbolToString.call(value) : '';
    }
    var result = (value + '');
    return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
  }

  return baseToString;

});
