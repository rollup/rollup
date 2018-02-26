define(['./_LazyWrapper.js', './_getData.js', './_getFuncName.js', './wrapperLodash.js'], function (___LazyWrapper_js, ___getData_js, ___getFuncName_js, __wrapperLodash_js) { 'use strict';

  /**
   * Checks if `func` has a lazy counterpart.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` has a lazy counterpart,
   *  else `false`.
   */
  function isLaziable(func) {
    var funcName = ___getFuncName_js.default(func),
        other = __wrapperLodash_js.default[funcName];

    if (typeof other != 'function' || !(funcName in ___LazyWrapper_js.default.prototype)) {
      return false;
    }
    if (func === other) {
      return true;
    }
    var data = ___getData_js.default(other);
    return !!data && func === data[0];
  }

  return isLaziable;

});
