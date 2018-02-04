System.register(['./_arrayPush.js', './_getPrototype.js', './_getSymbols.js', './stubArray.js'], function (exports, module) {
  'use strict';
  var arrayPush, getPrototype, getSymbols, stubArray;
  return {
    setters: [function (module) {
      arrayPush = module.default;
    }, function (module) {
      getPrototype = module.default;
    }, function (module) {
      getSymbols = module.default;
    }, function (module) {
      stubArray = module.default;
    }],
    execute: function () {

      /* Built-in method references for those with the same name as other `lodash` methods. */
      var nativeGetSymbols = Object.getOwnPropertySymbols;

      /**
       * Creates an array of the own and inherited enumerable symbols of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of symbols.
       */
      var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
        var result = [];
        while (object) {
          arrayPush(result, getSymbols(object));
          object = getPrototype(object);
        }
        return result;
      };
      exports('default', getSymbolsIn);

    }
  };
});
