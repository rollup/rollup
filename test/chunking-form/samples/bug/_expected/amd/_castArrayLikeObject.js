define(['./isArrayLikeObject.js'], function (__isArrayLikeObject_js) { 'use strict';

  /**
   * Casts `value` to an empty array if it's not an array like object.
   *
   * @private
   * @param {*} value The value to inspect.
   * @returns {Array|Object} Returns the cast array-like object.
   */
  function castArrayLikeObject(value) {
    return __isArrayLikeObject_js.default(value) ? value : [];
  }

  return castArrayLikeObject;

});
