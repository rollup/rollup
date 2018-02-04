System.register(['./_shuffleSelf.js', './values.js'], function (exports, module) {
  'use strict';
  var shuffleSelf, values;
  return {
    setters: [function (module) {
      shuffleSelf = module.default;
    }, function (module) {
      values = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.shuffle`.
       *
       * @private
       * @param {Array|Object} collection The collection to shuffle.
       * @returns {Array} Returns the new shuffled array.
       */
      function baseShuffle(collection) {
        return shuffleSelf(values(collection));
      }
      exports('default', baseShuffle);

    }
  };
});
