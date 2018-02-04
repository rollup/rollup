define(['./_getMapData.js'], function (___getMapData_js) { 'use strict';

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return ___getMapData_js.default(this, key).has(key);
  }

  return mapCacheHas;

});
