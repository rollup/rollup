System.register(['./_ListCache.js'], function (exports, module) {
  'use strict';
  var ListCache;
  return {
    setters: [function (module) {
      ListCache = module.default;
    }],
    execute: function () {

      /**
       * Removes all key-value entries from the stack.
       *
       * @private
       * @name clear
       * @memberOf Stack
       */
      function stackClear() {
        this.__data__ = new ListCache;
        this.size = 0;
      }
      exports('default', stackClear);

    }
  };
});
