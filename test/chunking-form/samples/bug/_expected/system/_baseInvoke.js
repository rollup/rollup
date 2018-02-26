System.register(['./_apply.js', './_castPath.js', './last.js', './_parent.js', './_toKey.js'], function (exports, module) {
  'use strict';
  var apply, castPath, last, parent, toKey;
  return {
    setters: [function (module) {
      apply = module.default;
    }, function (module) {
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
       * The base implementation of `_.invoke` without support for individual
       * method arguments.
       *
       * @private
       * @param {Object} object The object to query.
       * @param {Array|string} path The path of the method to invoke.
       * @param {Array} args The arguments to invoke the method with.
       * @returns {*} Returns the result of the invoked method.
       */
      function baseInvoke(object, path, args) {
        path = castPath(path, object);
        object = parent(object, path);
        var func = object == null ? object : object[toKey(last(path))];
        return func == null ? undefined : apply(func, object, args);
      }
      exports('default', baseInvoke);

    }
  };
});
