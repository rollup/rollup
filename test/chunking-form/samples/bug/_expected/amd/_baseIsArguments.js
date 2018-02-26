define(['./_baseGetTag.js', './isObjectLike.js'], function (___baseGetTag_js, __isObjectLike_js) { 'use strict';

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return __isObjectLike_js.default(value) && ___baseGetTag_js.default(value) == argsTag;
  }

  return baseIsArguments;

});
