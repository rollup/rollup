'use strict';

var ___copyObject_js = require('./_copyObject.js');
var __keysIn_js = require('./keysIn.js');

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

module.exports = baseAssignIn;
