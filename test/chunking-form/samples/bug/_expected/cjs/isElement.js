'use strict';

var __isObjectLike_js = require('./isObjectLike.js');
var __isPlainObject_js = require('./isPlainObject.js');

/**
 * Checks if `value` is likely a DOM element.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a DOM element, else `false`.
 * @example
 *
 * _.isElement(document.body);
 * // => true
 *
 * _.isElement('<body>');
 * // => false
 */
function isElement(value) {
  return __isObjectLike_js.default(value) && value.nodeType === 1 && !__isPlainObject_js.default(value);
}

module.exports = isElement;
