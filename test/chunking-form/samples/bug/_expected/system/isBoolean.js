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
      var boolTag = '[object Boolean]';

      /**
       * Checks if `value` is classified as a boolean primitive or object.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a boolean, else `false`.
       * @example
       *
       * _.isBoolean(false);
       * // => true
       *
       * _.isBoolean(null);
       * // => false
       */
      function isBoolean(value) {
        return value === true || value === false ||
          (isObjectLike(value) && baseGetTag(value) == boolTag);
      }
      exports('isBoolean', isBoolean);

    }
  };
});
