define(['./_Hash.js', './_ListCache.js', './_Map.js'], function (___Hash_js, ___ListCache_js, ___Map_js) { 'use strict';

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new ___Hash_js.default,
      'map': new (___Map_js.default || ___ListCache_js.default),
      'string': new ___Hash_js.default
    };
  }

  return mapCacheClear;

});
