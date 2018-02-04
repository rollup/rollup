System.register(['./_baseConformsTo.js', './keys.js'], function (exports, module) {
  'use strict';
  var baseConformsTo, keys;
  return {
    setters: [function (module) {
      baseConformsTo = module.default;
    }, function (module) {
      keys = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.conforms` which doesn't clone `source`.
       *
       * @private
       * @param {Object} source The object of property predicates to conform to.
       * @returns {Function} Returns the new spec function.
       */
      function baseConforms(source) {
        var props = keys(source);
        return function(object) {
          return baseConformsTo(object, source, props);
        };
      }
      exports('default', baseConforms);

    }
  };
});
