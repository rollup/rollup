System.register(['./_getTag.js', './isObjectLike.js'], function (exports, module) {
  'use strict';
  var getTag, isObjectLike;
  return {
    setters: [function (module) {
      getTag = module.default;
    }, function (module) {
      isObjectLike = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var mapTag = '[object Map]';

      /**
       * The base implementation of `_.isMap` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a map, else `false`.
       */
      function baseIsMap(value) {
        return isObjectLike(value) && getTag(value) == mapTag;
      }
      exports('default', baseIsMap);

    }
  };
});
