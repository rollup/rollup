System.register(['./_MapCache.js', './_setCacheAdd.js', './_setCacheHas.js'], function (exports, module) {
  'use strict';
  var MapCache, setCacheAdd, setCacheHas;
  return {
    setters: [function (module) {
      MapCache = module.default;
    }, function (module) {
      setCacheAdd = module.default;
    }, function (module) {
      setCacheHas = module.default;
    }],
    execute: function () {

      /**
       *
       * Creates an array cache object to store unique values.
       *
       * @private
       * @constructor
       * @param {Array} [values] The values to cache.
       */
      function SetCache(values) {
        var index = -1,
            length = values == null ? 0 : values.length;

        this.__data__ = new MapCache;
        while (++index < length) {
          this.add(values[index]);
        }
      }

      // Add methods to `SetCache`.
      SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
      SetCache.prototype.has = setCacheHas;
      exports('default', SetCache);

    }
  };
});
