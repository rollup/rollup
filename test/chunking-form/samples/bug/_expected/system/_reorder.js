System.register(['./_copyArray.js', './_isIndex.js'], function (exports, module) {
  'use strict';
  var copyArray, isIndex;
  return {
    setters: [function (module) {
      copyArray = module.default;
    }, function (module) {
      isIndex = module.default;
    }],
    execute: function () {

      /* Built-in method references for those with the same name as other `lodash` methods. */
      var nativeMin = Math.min;

      /**
       * Reorder `array` according to the specified indexes where the element at
       * the first index is assigned as the first element, the element at
       * the second index is assigned as the second element, and so on.
       *
       * @private
       * @param {Array} array The array to reorder.
       * @param {Array} indexes The arranged array indexes.
       * @returns {Array} Returns `array`.
       */
      function reorder(array, indexes) {
        var arrLength = array.length,
            length = nativeMin(indexes.length, arrLength),
            oldArray = copyArray(array);

        while (length--) {
          var index = indexes[length];
          array[length] = isIndex(index, arrLength) ? oldArray[index] : undefined;
        }
        return array;
      }
      exports('default', reorder);

    }
  };
});
