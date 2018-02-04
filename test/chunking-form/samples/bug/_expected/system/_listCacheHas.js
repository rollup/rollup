System.register(['./_assocIndexOf.js'], function (exports, module) {
  'use strict';
  var assocIndexOf;
  return {
    setters: [function (module) {
      assocIndexOf = module.default;
    }],
    execute: function () {

      /**
       * Checks if a list cache value for `key` exists.
       *
       * @private
       * @name has
       * @memberOf ListCache
       * @param {string} key The key of the entry to check.
       * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
       */
      function listCacheHas(key) {
        return assocIndexOf(this.__data__, key) > -1;
      }
      exports('default', listCacheHas);

    }
  };
});
