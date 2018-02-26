define(['./_baseIsNative.js', './_getValue.js'], function (___baseIsNative_js, ___getValue_js) { 'use strict';

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = ___getValue_js.default(object, key);
    return ___baseIsNative_js.default(value) ? value : undefined;
  }

  return getNative;

});
