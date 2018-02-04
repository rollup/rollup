System.register(['./_copyObject.js', './keysIn.js'], function (exports, module) {
  'use strict';
  var copyObject, keysIn$1;
  return {
    setters: [function (module) {
      copyObject = module.default;
    }, function (module) {
      keysIn$1 = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.assignIn` without support for multiple sources
       * or `customizer` functions.
       *
       * @private
       * @param {Object} object The destination object.
       * @param {Object} source The source object.
       * @returns {Object} Returns `object`.
       */
      function baseAssignIn(object, source) {
        return object && copyObject(source, keysIn$1(source), object);
      }
      exports('default', baseAssignIn);

    }
  };
});
