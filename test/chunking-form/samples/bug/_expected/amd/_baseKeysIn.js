define(['./isObject.js', './_isPrototype.js', './_nativeKeysIn.js'], function (__isObject_js, ___isPrototype_js, ___nativeKeysIn_js) { 'use strict';

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!__isObject_js.default(object)) {
      return ___nativeKeysIn_js.default(object);
    }
    var isProto = ___isPrototype_js.default(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  return baseKeysIn;

});
