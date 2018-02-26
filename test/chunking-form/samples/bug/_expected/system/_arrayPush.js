System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * Appends the elements of `values` to `array`.
       *
       * @private
       * @param {Array} array The array to modify.
       * @param {Array} values The values to append.
       * @returns {Array} Returns `array`.
       */
      function arrayPush(array, values) {
        var index = -1,
            length = values.length,
            offset = array.length;

        while (++index < length) {
          array[offset + index] = values[index];
        }
        return array;
      }
      exports('default', arrayPush);

    }
  };
});
