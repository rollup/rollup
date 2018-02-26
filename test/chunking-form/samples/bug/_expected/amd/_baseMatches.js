define(['./_baseIsMatch.js', './_getMatchData.js', './_matchesStrictComparable.js'], function (___baseIsMatch_js, ___getMatchData_js, ___matchesStrictComparable_js) { 'use strict';

  /**
   * The base implementation of `_.matches` which doesn't clone `source`.
   *
   * @private
   * @param {Object} source The object of property values to match.
   * @returns {Function} Returns the new spec function.
   */
  function baseMatches(source) {
    var matchData = ___getMatchData_js.default(source);
    if (matchData.length == 1 && matchData[0][2]) {
      return ___matchesStrictComparable_js.default(matchData[0][0], matchData[0][1]);
    }
    return function(object) {
      return object === source || ___baseIsMatch_js.default(object, source, matchData);
    };
  }

  return baseMatches;

});
