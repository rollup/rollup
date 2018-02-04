define(['./_baseGetAllKeys.js', './_getSymbolsIn.js', './keysIn.js'], function (___baseGetAllKeys_js, ___getSymbolsIn_js, __keysIn_js) { 'use strict';

  /**
   * Creates an array of own and inherited enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function getAllKeysIn(object) {
    return ___baseGetAllKeys_js.default(object, __keysIn_js.default, ___getSymbolsIn_js.default);
  }

  return getAllKeysIn;

});
