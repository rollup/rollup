System.register(['./_baseGetTag.js', './isObject.js'], function (exports, module) {
  'use strict';
  var baseGetTag, isObject;
  return {
    setters: [function (module) {
      baseGetTag = module.default;
    }, function (module) {
      isObject = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var asyncTag = '[object AsyncFunction]',
          funcTag = '[object Function]',
          genTag = '[object GeneratorFunction]',
          proxyTag = '[object Proxy]';

      /**
       * Checks if `value` is classified as a `Function` object.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is a function, else `false`.
       * @example
       *
       * _.isFunction(_);
       * // => true
       *
       * _.isFunction(/abc/);
       * // => false
       */
      function isFunction(value) {
        if (!isObject(value)) {
          return false;
        }
        // The use of `Object#toString` avoids issues with the `typeof` operator
        // in Safari 9 which returns 'object' for typed arrays and other constructors.
        var tag = baseGetTag(value);
        return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
      }
      exports('isFunction', isFunction);

    }
  };
});
