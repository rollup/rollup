define(['./constant.js', './_defineProperty.js', './identity.js'], function (__constant_js, ___defineProperty_js, __identity_js) { 'use strict';

  /**
   * The base implementation of `setToString` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var baseSetToString = !___defineProperty_js.default ? __identity_js.default : function(func, string) {
    return ___defineProperty_js.default(func, 'toString', {
      'configurable': true,
      'enumerable': false,
      'value': __constant_js.default(string),
      'writable': true
    });
  };

  return baseSetToString;

});
