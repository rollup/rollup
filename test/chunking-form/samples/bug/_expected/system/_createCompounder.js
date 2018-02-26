System.register(['./_arrayReduce.js', './deburr.js', './words.js'], function (exports, module) {
  'use strict';
  var arrayReduce, deburr, words;
  return {
    setters: [function (module) {
      arrayReduce = module.default;
    }, function (module) {
      deburr = module.default;
    }, function (module) {
      words = module.default;
    }],
    execute: function () {

      /** Used to compose unicode capture groups. */
      var rsApos = "['\u2019]";

      /** Used to match apostrophes. */
      var reApos = RegExp(rsApos, 'g');

      /**
       * Creates a function like `_.camelCase`.
       *
       * @private
       * @param {Function} callback The function to combine each word.
       * @returns {Function} Returns the new compounder function.
       */
      function createCompounder(callback) {
        return function(string) {
          return arrayReduce(words(deburr(string).replace(reApos, '')), callback, '');
        };
      }
      exports('default', createCompounder);

    }
  };
});
