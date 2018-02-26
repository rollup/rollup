System.register(['./_nativeCreate.js'], function (exports, module) {
  'use strict';
  var nativeCreate;
  return {
    setters: [function (module) {
      nativeCreate = module.default;
    }],
    execute: function () {

      /**
       * Removes all key-value entries from the hash.
       *
       * @private
       * @name clear
       * @memberOf Hash
       */
      function hashClear() {
        this.__data__ = nativeCreate ? nativeCreate(null) : {};
        this.size = 0;
      }
      exports('default', hashClear);

    }
  };
});
