System.register(['./_castPath.js', './isArguments.js', './isArray.js', './_isIndex.js', './isLength.js', './_toKey.js'], function (exports, module) {
  'use strict';
  var castPath, isArguments, isArray, isIndex, isLength, toKey;
  return {
    setters: [function (module) {
      castPath = module.default;
    }, function (module) {
      isArguments = module.default;
    }, function (module) {
      isArray = module.default;
    }, function (module) {
      isIndex = module.default;
    }, function (module) {
      isLength = module.default;
    }, function (module) {
      toKey = module.default;
    }],
    execute: function () {

      /**
       * Checks if `path` exists on `object`.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array|string} path The path to check.
       * @param {Function} hasFunc The function to check properties.
       * @returns {boolean} Returns `true` if `path` exists, else `false`.
       */
      function hasPath(object, path, hasFunc) {
        path = castPath(path, object);

        var index = -1,
            length = path.length,
            result = false;

        while (++index < length) {
          var key = toKey(path[index]);
          if (!(result = object != null && hasFunc(object, key))) {
            break;
          }
          object = object[key];
        }
        if (result || ++index != length) {
          return result;
        }
        length = object == null ? 0 : object.length;
        return !!length && isLength(length) && isIndex(key, length) &&
          (isArray(object) || isArguments(object));
      }
      exports('default', hasPath);

    }
  };
});
