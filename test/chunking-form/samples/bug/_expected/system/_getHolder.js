System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      /**
       * Gets the argument placeholder value for `func`.
       *
       * @private
       * @param {Function} func The function to inspect.
       * @returns {*} Returns the placeholder value.
       */
      function getHolder(func) {
        var object = func;
        return object.placeholder;
      }
      exports('default', getHolder);

    }
  };
});
