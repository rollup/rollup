define(['./_baseGetAllKeys.js', './_getSymbols.js', './keys.js'], function (___baseGetAllKeys_js, ___getSymbols_js, __keys_js) { 'use strict';

  /**
   * Creates an array of own enumerable property names and symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeys(object) {
    return ___baseGetAllKeys_js.default(object, __keys_js.default, ___getSymbols_js.default);
  }

  return getAllKeys;

});
