define(['./_baseGetTag.js', './isObjectLike.js'], function (___baseGetTag_js, __isObjectLike_js) { 'use strict';

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
    return __isObjectLike_js.default(value) && ___baseGetTag_js.default(value) == weakSetTag;
  }

  return isWeakSet;

});
