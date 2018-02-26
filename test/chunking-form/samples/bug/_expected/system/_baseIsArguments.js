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
      var argsTag = '[object Arguments]';

      /**
       * The base implementation of `_.isArguments`.
       *
       * @private
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an `arguments` object,
       */
      function baseIsArguments(value) {
        return isObjectLike(value) && baseGetTag(value) == argsTag;
      }
      exports('default', baseIsArguments);

    }
  };
});
