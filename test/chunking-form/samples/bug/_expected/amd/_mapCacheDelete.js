define(['./_getMapData.js'], function (___getMapData_js) { 'use strict';

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    var result = ___getMapData_js.default(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  return mapCacheDelete;

});
