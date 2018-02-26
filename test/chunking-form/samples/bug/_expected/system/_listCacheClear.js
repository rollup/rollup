System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * Removes all key-value entries from the list cache.
       *
       * @private
       * @name clear
       * @memberOf ListCache
       */
      function listCacheClear() {
        this.__data__ = [];
        this.size = 0;
      }
      exports('default', listCacheClear);

    }
  };
});
