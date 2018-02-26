System.register(['./isArrayLikeObject.js'], function (exports, module) {
  'use strict';
  var isArrayLikeObject;
  return {
    setters: [function (module) {
      isArrayLikeObject = module.default;
    }],
    execute: function () {

      /**
       * Casts `value` to an empty array if it's not an array like object.
       *
       * @private
       * @param {*} value The value to inspect.
       * @returns {Array|Object} Returns the cast array-like object.
       */
      function castArrayLikeObject(value) {
        return isArrayLikeObject(value) ? value : [];
      }
      exports('default', castArrayLikeObject);

    }
  };
});
