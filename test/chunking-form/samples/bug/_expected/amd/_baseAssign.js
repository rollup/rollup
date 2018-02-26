define(['./_copyObject.js', './keys.js'], function (___copyObject_js, __keys_js) { 'use strict';

  /**
   * The base implementation of `_.assign` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssign(object, source) {
    return object && ___copyObject_js.default(source, __keys_js.default(source), object);
  }

  return baseAssign;

});
