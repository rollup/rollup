define(['./_baseGetTag.js', './isArray.js', './isObjectLike.js'], function (___baseGetTag_js, __isArray_js, __isObjectLike_js) { 'use strict';

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
      (!__isArray_js.default(value) && __isObjectLike_js.default(value) && ___baseGetTag_js.default(value) == stringTag);
  }

  return isString;

});
