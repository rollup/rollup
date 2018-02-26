define(['./_mapCacheClear.js', './_mapCacheDelete.js', './_mapCacheGet.js', './_mapCacheHas.js', './_mapCacheSet.js'], function (___mapCacheClear_js, ___mapCacheDelete_js, ___mapCacheGet_js, ___mapCacheHas_js, ___mapCacheSet_js) { 'use strict';

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = ___mapCacheClear_js.default;
  MapCache.prototype['delete'] = ___mapCacheDelete_js.default;
  MapCache.prototype.get = ___mapCacheGet_js.default;
  MapCache.prototype.has = ___mapCacheHas_js.default;
  MapCache.prototype.set = ___mapCacheSet_js.default;

  return MapCache;

});
