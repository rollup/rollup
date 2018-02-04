System.register(['./_baseRandom.js'], function (exports, module) {
  'use strict';
  var baseRandom;
  return {
    setters: [function (module) {
      baseRandom = module.default;
    }],
    execute: function () {

      /**
       * A specialized version of `_.sample` for arrays.
       *
       * @private
       * @param {Array} array The array to sample.
       * @returns {*} Returns the random element.
       */
      function arraySample(array) {
        var length = array.length;
        return length ? array[baseRandom(0, length - 1)] : undefined;
      }
      exports('default', arraySample);

    }
  };
});
