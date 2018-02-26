System.register(['./isArray.js', './_isKey.js', './_stringToPath.js', './toString.js'], function (exports, module) {
  'use strict';
  var isArray, isKey, stringToPath, toString;
  return {
    setters: [function (module) {
      isArray = module.default;
    }, function (module) {
      isKey = module.default;
    }, function (module) {
      stringToPath = module.default;
    }, function (module) {
      toString = module.default;
    }],
    execute: function () {

      /**
       * Casts `value` to a path array if it's not one.
       *
       * @private
       * @param {*} value The value to inspect.
       * @param {Object} [object] The object to query keys on.
       * @returns {Array} Returns the cast property path array.
       */
      function castPath(value, object) {
        if (isArray(value)) {
          return value;
        }
        return isKey(value, object) ? [value] : stringToPath(toString(value));
      }
      exports('default', castPath);

    }
  };
});
