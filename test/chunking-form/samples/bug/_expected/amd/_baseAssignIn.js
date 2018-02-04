define(['./_copyObject.js', './keysIn.js'], function (___copyObject_js, __keysIn_js) { 'use strict';

  /**
   * The base implementation of `_.assignIn` without support for multiple sources
   * or `customizer` functions.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @returns {Object} Returns `object`.
   */
  function baseAssignIn(object, source) {
    return object && ___copyObject_js.default(source, __keysIn_js.default(source), object);
  }

  return baseAssignIn;

});
