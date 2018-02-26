System.register(['./_Hash.js', './_ListCache.js', './_Map.js'], function (exports, module) {
  'use strict';
  var Hash, ListCache, Map;
  return {
    setters: [function (module) {
      Hash = module.default;
    }, function (module) {
      ListCache = module.default;
    }, function (module) {
      Map = module.default;
    }],
    execute: function () {

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
          'hash': new Hash,
          'map': new (Map || ListCache),
          'string': new Hash
        };
      }
      exports('default', mapCacheClear);

    }
  };
});
