System.register(['./_getMapData.js'], function (exports, module) {
  'use strict';
  var getMapData;
  return {
    setters: [function (module) {
      getMapData = module.default;
    }],
    execute: function () {

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
        return getMapData(this, key).get(key);
      }
      exports('default', mapCacheGet);

    }
  };
});
