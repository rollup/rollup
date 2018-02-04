System.register(['./_baseIndexOf.js'], function (exports, module) {
  'use strict';
  var baseIndexOf;
  return {
    setters: [function (module) {
      baseIndexOf = module.default;
    }],
    execute: function () {

      /**
       * Used by `_.trim` and `_.trimStart` to get the index of the first string symbol
       * that is not found in the character symbols.
       *
       * @private
       * @param {Array} strSymbols The string symbols to inspect.
       * @param {Array} chrSymbols The character symbols to find.
       * @returns {number} Returns the index of the first unmatched string symbol.
       */
      function charsStartIndex(strSymbols, chrSymbols) {
        var index = -1,
            length = strSymbols.length;

        while (++index < length && baseIndexOf(chrSymbols, strSymbols[index], 0) > -1) {}
        return index;
      }
      exports('default', charsStartIndex);

    }
  };
});
