System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * Gets the stack value for `key`.
       *
       * @private
       * @name get
       * @memberOf Stack
       * @param {string} key The key of the value to get.
       * @returns {*} Returns the entry value.
       */
      function stackGet(key) {
        return this.__data__.get(key);
      }
      exports('default', stackGet);

    }
  };
});
