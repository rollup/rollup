define(['./_Symbol.js', './isArguments.js', './isArray.js'], function (___Symbol_js, __isArguments_js, __isArray_js) { 'use strict';

  /** Built-in value references. */
  var spreadableSymbol = ___Symbol_js.default ? ___Symbol_js.default.isConcatSpreadable : undefined;

  /**
   * Checks if `value` is a flattenable `arguments` object or array.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
   */
  function isFlattenable(value) {
    return __isArray_js.default(value) || __isArguments_js.default(value) ||
      !!(spreadableSymbol && value && value[spreadableSymbol]);
  }

  return isFlattenable;

});
