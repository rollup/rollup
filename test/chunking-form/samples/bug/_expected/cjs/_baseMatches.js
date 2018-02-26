'use strict';

var ___baseIsMatch_js = require('./_baseIsMatch.js');
var ___getMatchData_js = require('./_getMatchData.js');
var ___matchesStrictComparable_js = require('./_matchesStrictComparable.js');

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

module.exports = baseMatches;
