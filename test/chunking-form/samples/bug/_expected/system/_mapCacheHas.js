System.register(['./_getMapData.js'], function (exports, module) {
  'use strict';
  var getMapData;
  return {
    setters: [function (module) {
      getMapData = module.default;
    }],
    execute: function () {

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
        return getMapData(this, key).has(key);
      }
      exports('default', mapCacheHas);

    }
  };
});
