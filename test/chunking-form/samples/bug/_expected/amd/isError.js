define(['./_baseGetTag.js', './isObjectLike.js', './isPlainObject.js'], function (___baseGetTag_js, __isObjectLike_js, __isPlainObject_js) { 'use strict';

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
    if (!__isObjectLike_js.default(value)) {
      return false;
    }
    var tag = ___baseGetTag_js.default(value);
    return tag == errorTag || tag == domExcTag ||
      (typeof value.message == 'string' && typeof value.name == 'string' && !__isPlainObject_js.default(value));
  }

  return isError;

});
