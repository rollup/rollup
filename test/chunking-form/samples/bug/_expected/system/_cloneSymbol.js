System.register(['./_Symbol.js'], function (exports, module) {
  'use strict';
  var Symbol;
  return {
    setters: [function (module) {
      Symbol = module.default;
    }],
    execute: function () {

      /** Used to convert symbols to primitives and strings. */
      var symbolProto = Symbol ? Symbol.prototype : undefined,
          symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

      /**
       * Creates a clone of the `symbol` object.
       *
       * @private
       * @param {Object} symbol The symbol object to clone.
       * @returns {Object} Returns the cloned symbol object.
       */
      function cloneSymbol(symbol) {
        return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
      }
      exports('default', cloneSymbol);

    }
  };
});
