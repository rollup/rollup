define(['./_listCacheClear.js', './_listCacheDelete.js', './_listCacheGet.js', './_listCacheHas.js', './_listCacheSet.js'], function (___listCacheClear_js, ___listCacheDelete_js, ___listCacheGet_js, ___listCacheHas_js, ___listCacheSet_js) { 'use strict';

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = ___listCacheClear_js.default;
  ListCache.prototype['delete'] = ___listCacheDelete_js.default;
  ListCache.prototype.get = ___listCacheGet_js.default;
  ListCache.prototype.has = ___listCacheHas_js.default;
  ListCache.prototype.set = ___listCacheSet_js.default;

  return ListCache;

});
