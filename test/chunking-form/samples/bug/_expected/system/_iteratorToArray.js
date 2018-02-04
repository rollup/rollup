System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * Converts `iterator` to an array.
       *
       * @private
       * @param {Object} iterator The iterator to convert.
       * @returns {Array} Returns the converted array.
       */
      function iteratorToArray(iterator) {
        var data,
            result = [];

        while (!(data = iterator.next()).done) {
          result.push(data.value);
        }
        return result;
      }
      exports('default', iteratorToArray);

    }
  };
});
