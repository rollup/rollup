'use strict';

var ___getTag_js = require('./_getTag.js');
var __isObjectLike_js = require('./isObjectLike.js');

/** `Object#toString` result references. */
var weakMapTag = '[object WeakMap]';

/**
 * Checks if `value` is classified as a `WeakMap` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a weak map, else `false`.
 * @example
 *
 * _.isWeakMap(new WeakMap);
 * // => true
 *
 * _.isWeakMap(new Map);
 * // => false
 */
function isWeakMap(value) {
  return __isObjectLike_js.default(value) && ___getTag_js.default(value) == weakMapTag;
}

module.exports = isWeakMap;
