define(['./_arrayPush.js', './isArray.js'], function (___arrayPush_js, __isArray_js) { 'use strict';

  /**
   * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
   * `keysFunc` and `symbolsFunc` to get the enumerable property names and
   * symbols of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @param {Function} symbolsFunc The function to get the symbols of `object`.
   * @returns {Array} Returns the array of property names and symbols.
   */
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return __isArray_js.default(object) ? result : ___arrayPush_js.default(result, symbolsFunc(object));
  }

  return baseGetAllKeys;

});
