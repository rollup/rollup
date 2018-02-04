define(['./_getTag.js', './isObjectLike.js'], function (___getTag_js, __isObjectLike_js) { 'use strict';

  /** `Object#toString` result references. */
  var mapTag = '[object Map]';

  /**
   * The base implementation of `_.isMap` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a map, else `false`.
   */
  function baseIsMap(value) {
    return __isObjectLike_js.default(value) && ___getTag_js.default(value) == mapTag;
  }

  return baseIsMap;

});
