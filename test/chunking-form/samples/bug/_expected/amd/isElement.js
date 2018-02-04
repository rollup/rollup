define(['./isObjectLike.js', './isPlainObject.js'], function (__isObjectLike_js, __isPlainObject_js) { 'use strict';

  /**
   * Checks if `value` is likely a DOM element.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
   * @example
   *
   * _.isElement(document.body);
   * // => true
   *
   * _.isElement('<body>');
   * // => false
   */
  function isElement(value) {
    return __isObjectLike_js.default(value) && value.nodeType === 1 && !__isPlainObject_js.default(value);
  }

  return isElement;

});
