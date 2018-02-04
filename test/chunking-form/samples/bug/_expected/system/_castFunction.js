System.register(['./identity.js'], function (exports, module) {
  'use strict';
  var identity;
  return {
    setters: [function (module) {
      identity = module.default;
    }],
    execute: function () {

      /**
       * Casts `value` to `identity` if it's not a function.
       *
       * @private
       * @param {*} value The value to inspect.
       * @returns {Function} Returns cast function.
       */
      function castFunction(value) {
        return typeof value == 'function' ? value : identity;
      }
      exports('default', castFunction);

    }
  };
});
