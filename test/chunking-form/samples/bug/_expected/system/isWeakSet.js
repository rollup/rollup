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
      var weakSetTag = '[object WeakSet]';

      /**
       * Checks if `value` is classified as a `WeakSet` object.
       *
       * @static
       * @memberOf _
       * @since 4.3.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a weak set, else `false`.
       * @example
       *
       * _.isWeakSet(new WeakSet);
       * // => true
       *
       * _.isWeakSet(new Set);
       * // => false
       */
      function isWeakSet(value) {
        return isObjectLike(value) && baseGetTag(value) == weakSetTag;
      }
      exports('isWeakSet', isWeakSet);

    }
  };
});
