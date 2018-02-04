System.register(['./_baseGetAllKeys.js', './_getSymbols.js', './keys.js'], function (exports, module) {
  'use strict';
  var baseGetAllKeys, getSymbols, keys;
  return {
    setters: [function (module) {
      baseGetAllKeys = module.default;
    }, function (module) {
      getSymbols = module.default;
    }, function (module) {
      keys = module.default;
    }],
    execute: function () {

      /**
       * Creates an array of own enumerable property names and symbols of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names and symbols.
       */
      function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
      }
      exports('default', getAllKeys);

    }
  };
});
