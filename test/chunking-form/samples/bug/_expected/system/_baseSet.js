System.register(['./_assignValue.js', './_castPath.js', './_isIndex.js', './isObject.js', './_toKey.js'], function (exports, module) {
  'use strict';
  var assignValue, castPath, isIndex, isObject, toKey;
  return {
    setters: [function (module) {
      assignValue = module.default;
    }, function (module) {
      castPath = module.default;
    }, function (module) {
      isIndex = module.default;
    }, function (module) {
      isObject = module.default;
    }, function (module) {
      toKey = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.set`.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {Array|string} path The path of the property to set.
       * @param {*} value The value to set.
       * @param {Function} [customizer] The function to customize path creation.
       * @returns {Object} Returns `object`.
       */
      function baseSet(object, path, value, customizer) {
        if (!isObject(object)) {
          return object;
        }
        path = castPath(path, object);

        var index = -1,
            length = path.length,
            lastIndex = length - 1,
            nested = object;

        while (nested != null && ++index < length) {
          var key = toKey(path[index]),
              newValue = value;

          if (index != lastIndex) {
            var objValue = nested[key];
            newValue = customizer ? customizer(objValue, key, nested) : undefined;
            if (newValue === undefined) {
              newValue = isObject(objValue)
                ? objValue
                : (isIndex(path[index + 1]) ? [] : {});
            }
          }
          assignValue(nested, key, newValue);
          nested = nested[key];
        }
        return object;
      }
      exports('default', baseSet);

    }
  };
});
