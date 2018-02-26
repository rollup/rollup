'use strict';

var ___baseIsMap_js = require('./_baseIsMap.js');
var ___baseUnary_js = require('./_baseUnary.js');
var ___nodeUtil_js = require('./_nodeUtil.js');

/* Node.js helper references. */
var nodeIsMap = ___nodeUtil_js.default && ___nodeUtil_js.default.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? ___baseUnary_js.default(nodeIsMap) : ___baseIsMap_js.default;

module.exports = isMap;
