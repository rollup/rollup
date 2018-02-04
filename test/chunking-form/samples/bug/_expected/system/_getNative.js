System.register(['./_baseIsNative.js', './_getValue.js'], function (exports, module) {
  'use strict';
  var baseIsNative, getValue;
  return {
    setters: [function (module) {
      baseIsNative = module.default;
    }, function (module) {
      getValue = module.default;
    }],
    execute: function () {

      /**
       * Gets the native function at `key` of `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {string} key The key of the method to get.
       * @returns {*} Returns the function if it's native, else `undefined`.
       */
      function getNative(object, key) {
        var value = getValue(object, key);
        return baseIsNative(value) ? value : undefined;
      }
      exports('default', getNative);

    }
  };
});
