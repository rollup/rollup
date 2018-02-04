'use strict';

var ___assocIndexOf_js = require('./_assocIndexOf.js');

/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return ___assocIndexOf_js.default(this.__data__, key) > -1;
}

module.exports = listCacheHas;
