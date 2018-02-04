System.register(['./_ListCache.js', './_stackClear.js', './_stackDelete.js', './_stackGet.js', './_stackHas.js', './_stackSet.js'], function (exports, module) {
  'use strict';
  var ListCache, stackClear, stackDelete, stackGet, stackHas, stackSet;
  return {
    setters: [function (module) {
      ListCache = module.default;
    }, function (module) {
      stackClear = module.default;
    }, function (module) {
      stackDelete = module.default;
    }, function (module) {
      stackGet = module.default;
    }, function (module) {
      stackHas = module.default;
    }, function (module) {
      stackSet = module.default;
    }],
    execute: function () {

      /**
       * Creates a stack cache object to store key-value pairs.
       *
       * @private
       * @constructor
       * @param {Array} [entries] The key-value pairs to cache.
       */
      function Stack(entries) {
        var data = this.__data__ = new ListCache(entries);
        this.size = data.size;
      }

      // Add methods to `Stack`.
      Stack.prototype.clear = stackClear;
      Stack.prototype['delete'] = stackDelete;
      Stack.prototype.get = stackGet;
      Stack.prototype.has = stackHas;
      Stack.prototype.set = stackSet;
      exports('default', Stack);

    }
  };
});
