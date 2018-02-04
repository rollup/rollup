'use strict';

var __isArrayLikeObject_js = require('./isArrayLikeObject.js');

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

module.exports = castArrayLikeObject;
