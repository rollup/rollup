define(['./_getTag.js', './isObjectLike.js'], function (___getTag_js, __isObjectLike_js) { 'use strict';

  /** `Object#toString` result references. */
  var setTag = '[object Set]';

  /**
   * The base implementation of `_.isSet` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a set, else `false`.
   */
  function baseIsSet(value) {
    return __isObjectLike_js.default(value) && ___getTag_js.default(value) == setTag;
  }

  return baseIsSet;

});
