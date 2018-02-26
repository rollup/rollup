System.register(['./_arrayPush.js', './isArray.js'], function (exports, module) {
  'use strict';
  var arrayPush, isArray;
  return {
    setters: [function (module) {
      arrayPush = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

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
        return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
      }
      exports('default', baseGetAllKeys);

    }
  };
});
