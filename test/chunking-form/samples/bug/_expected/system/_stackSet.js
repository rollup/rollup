System.register(['./_ListCache.js', './_Map.js', './_MapCache.js'], function (exports, module) {
  'use strict';
  var ListCache, Map, MapCache;
  return {
    setters: [function (module) {
      ListCache = module.default;
    }, function (module) {
      Map = module.default;
    }, function (module) {
      MapCache = module.default;
    }],
    execute: function () {

      /** Used as the size to enable large array optimizations. */
      var LARGE_ARRAY_SIZE = 200;

      /**
       * Sets the stack `key` to `value`.
       *
       * @private
       * @name set
       * @memberOf Stack
       * @param {string} key The key of the value to set.
       * @param {*} value The value to set.
       * @returns {Object} Returns the stack cache instance.
       */
      function stackSet(key, value) {
        var data = this.__data__;
        if (data instanceof ListCache) {
          var pairs = data.__data__;
          if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
            pairs.push([key, value]);
            this.size = ++data.size;
            return this;
          }
          data = this.__data__ = new MapCache(pairs);
        }
        data.set(key, value);
        this.size = data.size;
        return this;
      }
      exports('default', stackSet);

    }
  };
});
