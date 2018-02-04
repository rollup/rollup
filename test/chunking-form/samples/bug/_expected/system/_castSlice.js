System.register(['./_baseSlice.js'], function (exports, module) {
  'use strict';
  var baseSlice;
  return {
    setters: [function (module) {
      baseSlice = module.default;
    }],
    execute: function () {

      /**
       * Casts `array` to a slice if it's needed.
       *
       * @private
       * @param {Array} array The array to inspect.
       * @param {number} start The start position.
       * @param {number} [end=array.length] The end position.
       * @returns {Array} Returns the cast slice.
       */
      function castSlice(array, start, end) {
        var length = array.length;
        end = end === undefined ? length : end;
        return (!start && end >= length) ? array : baseSlice(array, start, end);
      }
      exports('default', castSlice);

    }
  };
});
