System.register(['./_basePickBy.js', './hasIn.js'], function (exports, module) {
  'use strict';
  var basePickBy, hasIn;
  return {
    setters: [function (module) {
      basePickBy = module.default;
    }, function (module) {
      hasIn = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.pick` without support for individual
       * property identifiers.
       *
       * @private
       * @param {Object} object The source object.
       * @param {string[]} paths The property paths to pick.
       * @returns {Object} Returns the new object.
       */
      function basePick(object, paths) {
        return basePickBy(object, paths, function(value, path) {
          return hasIn(object, path);
        });
      }
      exports('default', basePick);

    }
  };
});
