define(['./identity.js', './_overRest.js', './_setToString.js'], function (__identity_js, ___overRest_js, ___setToString_js) { 'use strict';

  /**
   * The base implementation of `_.rest` which doesn't validate or coerce arguments.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   */
  function baseRest(func, start) {
    return ___setToString_js.default(___overRest_js.default(func, start, __identity_js.default), func + '');
  }

  return baseRest;

});
