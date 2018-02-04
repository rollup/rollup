define(['./flatten.js', './_overRest.js', './_setToString.js'], function (__flatten_js, ___overRest_js, ___setToString_js) { 'use strict';

  /**
   * A specialized version of `baseRest` which flattens the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @returns {Function} Returns the new function.
   */
  function flatRest(func) {
    return ___setToString_js.default(___overRest_js.default(func, undefined, __flatten_js.default), func + '');
  }

  return flatRest;

});
