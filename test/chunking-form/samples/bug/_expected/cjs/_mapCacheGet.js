'use strict';

var ___getMapData_js = require('./_getMapData.js');

/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return ___getMapData_js.default(this, key).get(key);
}

module.exports = mapCacheGet;
