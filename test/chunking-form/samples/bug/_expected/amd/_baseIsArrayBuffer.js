define(['./_baseGetTag.js', './isObjectLike.js'], function (___baseGetTag_js, __isObjectLike_js) { 'use strict';

  var arrayBufferTag = '[object ArrayBuffer]';

  /**
   * The base implementation of `_.isArrayBuffer` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
   */
  function baseIsArrayBuffer(value) {
    return __isObjectLike_js.default(value) && ___baseGetTag_js.default(value) == arrayBufferTag;
  }

  return baseIsArrayBuffer;

});
