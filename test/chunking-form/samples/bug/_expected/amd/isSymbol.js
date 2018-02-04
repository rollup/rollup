define(['./_baseGetTag.js', './isObjectLike.js'], function (___baseGetTag_js, __isObjectLike_js) { 'use strict';

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (__isObjectLike_js.default(value) && ___baseGetTag_js.default(value) == symbolTag);
  }

  return isSymbol;

});
