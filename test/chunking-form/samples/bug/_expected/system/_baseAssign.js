System.register(['./_copyObject.js', './keys.js'], function (exports, module) {
  'use strict';
  var copyObject, keys;
  return {
    setters: [function (module) {
      copyObject = module.default;
    }, function (module) {
      keys = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `_.assign` without support for multiple sources
       * or `customizer` functions.
       *
       * @private
       * @param {Object} object The destination object.
       * @param {Object} source The source object.
       * @returns {Object} Returns `object`.
       */
      function baseAssign(object, source) {
        return object && copyObject(source, keys(source), object);
      }
      exports('default', baseAssign);

    }
  };
});
