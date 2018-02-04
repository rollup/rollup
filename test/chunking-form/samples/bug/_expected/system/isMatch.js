System.register(['./_baseIsMatch.js', './_getMatchData.js'], function (exports, module) {
  'use strict';
  var baseIsMatch, getMatchData;
  return {
    setters: [function (module) {
      baseIsMatch = module.default;
    }, function (module) {
      getMatchData = module.default;
    }],
    execute: function () {

      /**
       * Performs a partial deep comparison between `object` and `source` to
       * determine if `object` contains equivalent property values.
       *
       * **Note:** This method is equivalent to `_.matches` when `source` is
       * partially applied.
       *
       * Partial comparisons will match empty array and empty object `source`
       * values against any array or object value, respectively. See `_.isEqual`
       * for a list of supported value comparisons.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Lang
       * @param {Object} object The object to inspect.
       * @param {Object} source The object of property values to match.
       * @returns {boolean} Returns `true` if `object` is a match, else `false`.
       * @example
       *
       * var object = { 'a': 1, 'b': 2 };
       *
       * _.isMatch(object, { 'b': 2 });
       * // => true
       *
       * _.isMatch(object, { 'b': 1 });
       * // => false
       */
      function isMatch(object, source) {
        return object === source || baseIsMatch(object, source, getMatchData(source));
      }
      exports('isMatch', isMatch);

    }
  };
});
