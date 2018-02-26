define(['./_baseGetTag.js', './isObjectLike.js'], function (___baseGetTag_js, __isObjectLike_js) { 'use strict';

  /** `Object#toString` result references. */
  var numberTag = '[object Number]';

  /**
   * Checks if `value` is classified as a `Number` primitive or object.
   *
   * **Note:** To exclude `Infinity`, `-Infinity`, and `NaN`, which are
   * classified as numbers, use the `_.isFinite` method.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a number, else `false`.
   * @example
   *
   * _.isNumber(3);
   * // => true
   *
   * _.isNumber(Number.MIN_VALUE);
   * // => true
   *
   * _.isNumber(Infinity);
   * // => true
   *
   * _.isNumber('3');
   * // => false
   */
  function isNumber(value) {
    return typeof value == 'number' ||
      (__isObjectLike_js.default(value) && ___baseGetTag_js.default(value) == numberTag);
  }

  return isNumber;

});
