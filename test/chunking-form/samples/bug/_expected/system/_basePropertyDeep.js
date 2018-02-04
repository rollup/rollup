System.register(['./_baseGet.js'], function (exports, module) {
  'use strict';
  var baseGet;
  return {
    setters: [function (module) {
      baseGet = module.default;
    }],
    execute: function () {

      /**
       * A specialized version of `baseProperty` which supports deep paths.
       *
       * @private
       * @param {Array|string} path The path of the property to get.
       * @returns {Function} Returns the new accessor function.
       */
      function basePropertyDeep(path) {
        return function(object) {
          return baseGet(object, path);
        };
      }
      exports('default', basePropertyDeep);

    }
  };
});
