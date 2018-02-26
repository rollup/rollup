System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * The base implementation of `_.lt` which doesn't coerce arguments.
       *
       * @private
       * @param {*} value The value to compare.
       * @param {*} other The other value to compare.
       * @returns {boolean} Returns `true` if `value` is less than `other`,
       *  else `false`.
       */
      function baseLt(value, other) {
        return value < other;
      }
      exports('default', baseLt);

    }
  };
});
