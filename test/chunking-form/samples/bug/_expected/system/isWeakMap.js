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
      var weakMapTag = '[object WeakMap]';

      /**
       * Checks if `value` is classified as a `WeakMap` object.
       *
       * @static
       * @memberOf _
       * @since 4.3.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a weak map, else `false`.
       * @example
       *
       * _.isWeakMap(new WeakMap);
       * // => true
       *
       * _.isWeakMap(new Map);
       * // => false
       */
      function isWeakMap(value) {
        return isObjectLike(value) && getTag(value) == weakMapTag;
      }
      exports('isWeakMap', isWeakMap);

    }
  };
});
