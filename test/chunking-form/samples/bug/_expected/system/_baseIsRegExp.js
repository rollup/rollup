System.register(['./_baseGetTag.js', './isObjectLike.js'], function (exports, module) {
  'use strict';
  var baseGetTag, isObjectLike;
  return {
    setters: [function (module) {
      baseGetTag = module.default;
    }, function (module) {
      isObjectLike = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var regexpTag = '[object RegExp]';

      /**
       * The base implementation of `_.isRegExp` without Node.js optimizations.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
       */
      function baseIsRegExp(value) {
        return isObjectLike(value) && baseGetTag(value) == regexpTag;
      }
      exports('default', baseIsRegExp);

    }
  };
});
