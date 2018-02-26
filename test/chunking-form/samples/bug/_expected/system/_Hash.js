System.register(['./_hashClear.js', './_hashDelete.js', './_hashGet.js', './_hashHas.js', './_hashSet.js'], function (exports, module) {
  'use strict';
  var hashClear, hashDelete, hashGet, hashHas, hashSet;
  return {
    setters: [function (module) {
      hashClear = module.default;
    }, function (module) {
      hashDelete = module.default;
    }, function (module) {
      hashGet = module.default;
    }, function (module) {
      hashHas = module.default;
    }, function (module) {
      hashSet = module.default;
    }],
    execute: function () {

      /**
       * Creates a hash object.
       *
       * @private
       * @constructor
       * @param {Array} [entries] The key-value pairs to cache.
       */
      function Hash(entries) {
        var index = -1,
            length = entries == null ? 0 : entries.length;

        this.clear();
        while (++index < length) {
          var entry = entries[index];
          this.set(entry[0], entry[1]);
        }
      }

      // Add methods to `Hash`.
      Hash.prototype.clear = hashClear;
      Hash.prototype['delete'] = hashDelete;
      Hash.prototype.get = hashGet;
      Hash.prototype.has = hashHas;
      Hash.prototype.set = hashSet;
      exports('default', Hash);

    }
  };
});
