'use strict';

var ___baseGetTag_js = require('./_baseGetTag.js');
var __isObjectLike_js = require('./isObjectLike.js');

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

module.exports = baseIsArrayBuffer;
