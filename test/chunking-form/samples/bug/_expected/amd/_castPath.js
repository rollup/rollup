define(['./isArray.js', './_isKey.js', './_stringToPath.js', './toString.js'], function (__isArray_js, ___isKey_js, ___stringToPath_js, __toString_js) { 'use strict';

  /**
   * Casts `value` to a path array if it's not one.
   *
   * @private
   * @param {*} value The value to inspect.
   * @param {Object} [object] The object to query keys on.
   * @returns {Array} Returns the cast property path array.
   */
  function castPath(value, object) {
    if (__isArray_js.default(value)) {
      return value;
    }
    return ___isKey_js.default(value, object) ? [value] : ___stringToPath_js.default(__toString_js.default(value));
  }

  return castPath;

});
