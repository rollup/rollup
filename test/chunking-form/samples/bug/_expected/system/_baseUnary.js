System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * The base implementation of `_.unary` without support for storing metadata.
       *
       * @private
       * @param {Function} func The function to cap arguments for.
       * @returns {Function} Returns the new capped function.
       */
      function baseUnary(func) {
        return function(value) {
          return func(value);
        };
      }
      exports('default', baseUnary);

    }
  };
});
