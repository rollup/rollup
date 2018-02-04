System.register(['./_castPath.js', './last.js', './_parent.js', './_toKey.js'], function (exports, module) {
  'use strict';
  var castPath, last, parent, toKey;
  return {
    setters: [function (module) {
      castPath = module.default;
    }, function (module) {
      last = module.default;
    }, function (module) {
      parent = module.default;
    }, function (module) {
      toKey = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.unset`.
       *
       * @private
       * @param {Object} object The object to modify.
       * @param {Array|string} path The property path to unset.
       * @returns {boolean} Returns `true` if the property is deleted, else `false`.
       */
      function baseUnset(object, path) {
        path = castPath(path, object);
        object = parent(object, path);
        return object == null || delete object[toKey(last(path))];
      }
      exports('default', baseUnset);

    }
  };
});
