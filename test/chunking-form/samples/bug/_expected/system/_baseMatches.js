System.register(['./_baseIsMatch.js', './_getMatchData.js', './_matchesStrictComparable.js'], function (exports, module) {
  'use strict';
  var baseIsMatch, getMatchData, matchesStrictComparable;
  return {
    setters: [function (module) {
      baseIsMatch = module.default;
    }, function (module) {
      getMatchData = module.default;
    }, function (module) {
      matchesStrictComparable = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.matches` which doesn't clone `source`.
       *
       * @private
       * @param {Object} source The object of property values to match.
       * @returns {Function} Returns the new spec function.
       */
      function baseMatches(source) {
        var matchData = getMatchData(source);
        if (matchData.length == 1 && matchData[0][2]) {
          return matchesStrictComparable(matchData[0][0], matchData[0][1]);
        }
        return function(object) {
          return object === source || baseIsMatch(object, source, matchData);
        };
      }
      exports('default', baseMatches);

    }
  };
});
