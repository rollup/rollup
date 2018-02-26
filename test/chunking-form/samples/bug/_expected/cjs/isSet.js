'use strict';

var ___baseIsSet_js = require('./_baseIsSet.js');
var ___baseUnary_js = require('./_baseUnary.js');
var ___nodeUtil_js = require('./_nodeUtil.js');

/* Node.js helper references. */
var nodeIsSet = ___nodeUtil_js.default && ___nodeUtil_js.default.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? ___baseUnary_js.default(nodeIsSet) : ___baseIsSet_js.default;

module.exports = isSet;
