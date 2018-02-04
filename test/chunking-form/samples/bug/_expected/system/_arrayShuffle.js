System.register(['./_copyArray.js', './_shuffleSelf.js'], function (exports, module) {
  'use strict';
  var copyArray, shuffleSelf;
  return {
    setters: [function (module) {
      copyArray = module.default;
    }, function (module) {
      shuffleSelf = module.default;
    }],
    execute: function () {

      /**
       * A specialized version of `_.shuffle` for arrays.
       *
       * @private
       * @param {Array} array The array to shuffle.
       * @returns {Array} Returns the new shuffled array.
       */
      function arrayShuffle(array) {
        return shuffleSelf(copyArray(array));
      }
      exports('default', arrayShuffle);

    }
  };
});
