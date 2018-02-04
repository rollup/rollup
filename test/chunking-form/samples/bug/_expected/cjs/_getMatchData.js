'use strict';

var ___isStrictComparable_js = require('./_isStrictComparable.js');
var __keys_js = require('./keys.js');

/**
 * Gets the property names, values, and compare flags of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the match data of `object`.
 */
function getMatchData(object) {
  var result = __keys_js.default(object),
      length = result.length;

  while (length--) {
    var key = result[length],
        value = object[key];

    result[length] = [key, value, ___isStrictComparable_js.default(value)];
  }
  return result;
}

module.exports = getMatchData;
