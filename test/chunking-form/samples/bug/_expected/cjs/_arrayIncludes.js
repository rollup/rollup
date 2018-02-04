'use strict';

var ___baseIndexOf_js = require('./_baseIndexOf.js');

/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && ___baseIndexOf_js.default(array, value, 0) > -1;
}

module.exports = arrayIncludes;
