define(['./_getTag.js', './isObjectLike.js'], function (___getTag_js, __isObjectLike_js) { 'use strict';

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
    return __isObjectLike_js.default(value) && ___getTag_js.default(value) == weakMapTag;
  }

  return isWeakMap;

});
