System.register(['./_baseGetTag.js', './isArray.js', './isObjectLike.js'], function (exports, module) {
  'use strict';
  var baseGetTag, isArray, isObjectLike;
  return {
    setters: [function (module) {
      baseGetTag = module.default;
    }, function (module) {
      isArray = module.default;
    }, function (module) {
      isObjectLike = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var stringTag = '[object String]';

      /**
       * Checks if `value` is classified as a `String` primitive or object.
       *
       * @static
       * @since 0.1.0
       * @memberOf _
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a string, else `false`.
       * @example
       *
       * _.isString('abc');
       * // => true
       *
       * _.isString(1);
       * // => false
       */
      function isString(value) {
        return typeof value == 'string' ||
          (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
      }
      exports('isString', isString);

    }
  };
});
