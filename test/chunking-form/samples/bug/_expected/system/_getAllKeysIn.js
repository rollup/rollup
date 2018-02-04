System.register(['./_baseGetAllKeys.js', './_getSymbolsIn.js', './keysIn.js'], function (exports, module) {
  'use strict';
  var baseGetAllKeys, getSymbolsIn, keysIn$1;
  return {
    setters: [function (module) {
      baseGetAllKeys = module.default;
    }, function (module) {
      getSymbolsIn = module.default;
    }, function (module) {
      keysIn$1 = module.default;
    }],
    execute: function () {

      /**
       * Creates an array of own and inherited enumerable property names and
       * symbols of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names and symbols.
       */
      function getAllKeysIn(object) {
        return baseGetAllKeys(object, keysIn$1, getSymbolsIn);
      }
      exports('default', getAllKeysIn);

    }
  };
});
