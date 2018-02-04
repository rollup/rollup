'use strict';

var __isArray_js = require('./isArray.js');
var ___isKey_js = require('./_isKey.js');
var ___stringToPath_js = require('./_stringToPath.js');
var __toString_js = require('./toString.js');

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

module.exports = castPath;
