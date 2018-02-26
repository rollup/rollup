define(['./_isStrictComparable.js', './keys.js'], function (___isStrictComparable_js, __keys_js) { 'use strict';

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

  return getMatchData;

});
