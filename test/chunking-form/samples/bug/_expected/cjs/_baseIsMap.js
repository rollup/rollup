'use strict';

var ___getTag_js = require('./_getTag.js');
var __isObjectLike_js = require('./isObjectLike.js');

/** `Object#toString` result references. */
var mapTag = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return __isObjectLike_js.default(value) && ___getTag_js.default(value) == mapTag;
}

module.exports = baseIsMap;
