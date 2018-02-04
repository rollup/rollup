System.register(['./_copyObject.js', './_getSymbolsIn.js'], function (exports, module) {
  'use strict';
  var copyObject, getSymbolsIn;
  return {
    setters: [function (module) {
      copyObject = module.default;
    }, function (module) {
      getSymbolsIn = module.default;
    }],
    execute: function () {

      /**
       * Copies own and inherited symbols of `source` to `object`.
       *
       * @private
       * @param {Object} source The object to copy symbols from.
       * @param {Object} [object={}] The object to copy symbols to.
       * @returns {Object} Returns `object`.
       */
      function copySymbolsIn(source, object) {
        return copyObject(source, getSymbolsIn(source), object);
      }
      exports('default', copySymbolsIn);

    }
  };
});
