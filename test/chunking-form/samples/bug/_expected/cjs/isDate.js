'use strict';

var ___baseIsDate_js = require('./_baseIsDate.js');
var ___baseUnary_js = require('./_baseUnary.js');
var ___nodeUtil_js = require('./_nodeUtil.js');

/* Node.js helper references. */
var nodeIsDate = ___nodeUtil_js.default && ___nodeUtil_js.default.isDate;

/**
 * Checks if `value` is classified as a `Date` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
 * @example
 *
 * _.isDate(new Date);
 * // => true
 *
 * _.isDate('Mon April 23 2012');
 * // => false
 */
var isDate = nodeIsDate ? ___baseUnary_js.default(nodeIsDate) : ___baseIsDate_js.default;

module.exports = isDate;
