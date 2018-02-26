System.register(['./_arrayShuffle.js', './_baseShuffle.js', './isArray.js'], function (exports, module) {
  'use strict';
  var arrayShuffle, baseShuffle, isArray;
  return {
    setters: [function (module) {
      arrayShuffle = module.default;
    }, function (module) {
      baseShuffle = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

      /**
       * Creates an array of shuffled values, using a version of the
       * [Fisher-Yates shuffle](https://en.wikipedia.org/wiki/Fisher-Yates_shuffle).
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to shuffle.
       * @returns {Array} Returns the new shuffled array.
       * @example
       *
       * _.shuffle([1, 2, 3, 4]);
       * // => [4, 1, 3, 2]
       */
      function shuffle(collection) {
        var func = isArray(collection) ? arrayShuffle : baseShuffle;
        return func(collection);
      }
      exports('default', shuffle);

    }
  };
});
