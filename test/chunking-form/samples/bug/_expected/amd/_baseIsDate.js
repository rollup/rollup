define(['./_baseGetTag.js', './isObjectLike.js'], function (___baseGetTag_js, __isObjectLike_js) { 'use strict';

  /** `Object#toString` result references. */
  var dateTag = '[object Date]';

  /**
   * The base implementation of `_.isDate` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
   */
  function baseIsDate(value) {
    return __isObjectLike_js.default(value) && ___baseGetTag_js.default(value) == dateTag;
  }

  return baseIsDate;

});
