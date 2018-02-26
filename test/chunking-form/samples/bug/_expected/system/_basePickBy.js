System.register(['./_baseGet.js', './_baseSet.js', './_castPath.js'], function (exports, module) {
  'use strict';
  var baseGet, baseSet, castPath;
  return {
    setters: [function (module) {
      baseGet = module.default;
    }, function (module) {
      baseSet = module.default;
    }, function (module) {
      castPath = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of  `_.pickBy` without support for iteratee shorthands.
       *
       * @private
       * @param {Object} object The source object.
       * @param {string[]} paths The property paths to pick.
       * @param {Function} predicate The function invoked per property.
       * @returns {Object} Returns the new object.
       */
      function basePickBy(object, paths, predicate) {
        var index = -1,
            length = paths.length,
            result = {};

        while (++index < length) {
          var path = paths[index],
              value = baseGet(object, path);

          if (predicate(value, path)) {
            baseSet(result, castPath(path, object), value);
          }
        }
        return result;
      }
      exports('default', basePickBy);

    }
  };
});
