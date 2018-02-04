System.register(['./_copyObject.js', './_getSymbols.js'], function (exports, module) {
  'use strict';
  var copyObject, getSymbols;
  return {
    setters: [function (module) {
      copyObject = module.default;
    }, function (module) {
      getSymbols = module.default;
    }],
    execute: function () {

      /**
       * Copies own symbols of `source` to `object`.
       *
       * @private
       * @param {Object} source The object to copy symbols from.
       * @param {Object} [object={}] The object to copy symbols to.
       * @returns {Object} Returns `object`.
       */
      function copySymbols(source, object) {
        return copyObject(source, getSymbols(source), object);
      }
      exports('default', copySymbols);

    }
  };
});
