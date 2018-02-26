System.register(['./_listCacheClear.js', './_listCacheDelete.js', './_listCacheGet.js', './_listCacheHas.js', './_listCacheSet.js'], function (exports, module) {
  'use strict';
  var listCacheClear, listCacheDelete, listCacheGet, listCacheHas, listCacheSet;
  return {
    setters: [function (module) {
      listCacheClear = module.default;
    }, function (module) {
      listCacheDelete = module.default;
    }, function (module) {
      listCacheGet = module.default;
    }, function (module) {
      listCacheHas = module.default;
    }, function (module) {
      listCacheSet = module.default;
    }],
    execute: function () {

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
      ListCache.prototype.clear = listCacheClear;
      ListCache.prototype['delete'] = listCacheDelete;
      ListCache.prototype.get = listCacheGet;
      ListCache.prototype.has = listCacheHas;
      ListCache.prototype.set = listCacheSet;
      exports('default', ListCache);

    }
  };
});
