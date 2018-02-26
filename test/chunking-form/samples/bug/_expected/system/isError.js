System.register(['./_baseGetTag.js', './isObjectLike.js', './isPlainObject.js'], function (exports, module) {
  'use strict';
  var baseGetTag, isObjectLike, isPlainObject;
  return {
    setters: [function (module) {
      baseGetTag = module.default;
    }, function (module) {
      isObjectLike = module.default;
    }, function (module) {
      isPlainObject = module.default;
    }],
    execute: function () {

      /** `Object#toString` result references. */
      var domExcTag = '[object DOMException]',
          errorTag = '[object Error]';

      /**
       * Checks if `value` is an `Error`, `EvalError`, `RangeError`, `ReferenceError`,
       * `SyntaxError`, `TypeError`, or `URIError` object.
       *
       * @static
       * @memberOf _
       * @since 3.0.0
       * @category Lang
       * @param {*} value The value to check.
       * @returns {boolean} Returns `true` if `value` is an error object, else `false`.
       * @example
       *
       * _.isError(new Error);
       * // => true
       *
       * _.isError(Error);
       * // => false
       */
      function isError(value) {
        if (!isObjectLike(value)) {
          return false;
        }
        var tag = baseGetTag(value);
        return tag == errorTag || tag == domExcTag ||
          (typeof value.message == 'string' && typeof value.name == 'string' && !isPlainObject(value));
      }
      exports('isError', isError);

    }
  };
});
