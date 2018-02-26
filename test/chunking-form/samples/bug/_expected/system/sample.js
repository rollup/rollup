System.register(['./_arraySample.js', './_baseSample.js', './isArray.js'], function (exports, module) {
  'use strict';
  var arraySample, baseSample, isArray;
  return {
    setters: [function (module) {
      arraySample = module.default;
    }, function (module) {
      baseSample = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

      /**
       * Gets a random element from `collection`.
       *
       * @static
       * @memberOf _
       * @since 2.0.0
       * @category Collection
       * @param {Array|Object} collection The collection to sample.
       * @returns {*} Returns the random element.
       * @example
       *
       * _.sample([1, 2, 3, 4]);
       * // => 2
       */
      function sample(collection) {
        var func = isArray(collection) ? arraySample : baseSample;
        return func(collection);
      }
      exports('default', sample);

    }
  };
});
