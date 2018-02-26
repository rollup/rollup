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
      var setTag = '[object Set]';

      /**
       * The base implementation of `_.isSet` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a set, else `false`.
       */
      function baseIsSet(value) {
        return isObjectLike(value) && getTag(value) == setTag;
      }
      exports('default', baseIsSet);

    }
  };
});
