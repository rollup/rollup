System.register(['./_mapCacheClear.js', './_mapCacheDelete.js', './_mapCacheGet.js', './_mapCacheHas.js', './_mapCacheSet.js'], function (exports, module) {
  'use strict';
  var mapCacheClear, mapCacheDelete, mapCacheGet, mapCacheHas, mapCacheSet;
  return {
    setters: [function (module) {
      mapCacheClear = module.default;
    }, function (module) {
      mapCacheDelete = module.default;
    }, function (module) {
      mapCacheGet = module.default;
    }, function (module) {
      mapCacheHas = module.default;
    }, function (module) {
      mapCacheSet = module.default;
    }],
    execute: function () {

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
      MapCache.prototype.clear = mapCacheClear;
      MapCache.prototype['delete'] = mapCacheDelete;
      MapCache.prototype.get = mapCacheGet;
      MapCache.prototype.has = mapCacheHas;
      MapCache.prototype.set = mapCacheSet;
      exports('default', MapCache);

    }
  };
});
