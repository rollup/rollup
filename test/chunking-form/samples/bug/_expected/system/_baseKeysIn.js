System.register(['./isObject.js', './_isPrototype.js', './_nativeKeysIn.js'], function (exports, module) {
  'use strict';
  var isObject, isPrototype, nativeKeysIn;
  return {
    setters: [function (module) {
      isObject = module.default;
    }, function (module) {
      isPrototype = module.default;
    }, function (module) {
      nativeKeysIn = module.default;
    }],
    execute: function () {

      /** Used for built-in method references. */
      var objectProto = Object.prototype;

      /** Used to check objects for own properties. */
      var hasOwnProperty = objectProto.hasOwnProperty;

      /**
       * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
       *
       * @private
       * @param {Object} object The object to query.
       * @returns {Array} Returns the array of property names.
       */
      function baseKeysIn(object) {
        if (!isObject(object)) {
          return nativeKeysIn(object);
        }
        var isProto = isPrototype(object),
            result = [];

        for (var key in object) {
          if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
            result.push(key);
          }
        }
        return result;
      }
      exports('default', baseKeysIn);

    }
  };
});
