System.register(['./_assocIndexOf.js'], function (exports, module) {
  'use strict';
  var assocIndexOf;
  return {
    setters: [function (module) {
      assocIndexOf = module.default;
    }],
    execute: function () {

      /**
       * Gets the list cache value for `key`.
       *
       * @private
       * @name get
       * @memberOf ListCache
       * @param {string} key The key of the value to get.
       * @returns {*} Returns the entry value.
       */
      function listCacheGet(key) {
        var data = this.__data__,
            index = assocIndexOf(data, key);

        return index < 0 ? undefined : data[index][1];
      }
      exports('default', listCacheGet);

    }
  };
});
