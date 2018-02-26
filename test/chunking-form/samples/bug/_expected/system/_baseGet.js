System.register(['./_castPath.js', './_toKey.js'], function (exports, module) {
  'use strict';
  var castPath, toKey;
  return {
    setters: [function (module) {
      castPath = module.default;
    }, function (module) {
      toKey = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.get` without support for default values.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array|string} path The path of the property to get.
       * @returns {*} Returns the resolved value.
       */
      function baseGet(object, path) {
        path = castPath(path, object);

        var index = 0,
            length = path.length;

        while (object != null && index < length) {
          object = object[toKey(path[index++])];
        }
        return (index && index == length) ? object : undefined;
      }
      exports('default', baseGet);

    }
  };
});
