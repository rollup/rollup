System.register(['./_arraySample.js', './values.js'], function (exports, module) {
  'use strict';
  var arraySample, values;
  return {
    setters: [function (module) {
      arraySample = module.default;
    }, function (module) {
      values = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.sample`.
       *
       * @private
       * @param {Array|Object} collection The collection to sample.
       * @returns {*} Returns the random element.
       */
      function baseSample(collection) {
        return arraySample(values(collection));
      }
      exports('default', baseSample);

    }
  };
});
