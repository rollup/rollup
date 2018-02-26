define(['./_baseIsRegExp.js', './_baseUnary.js', './_nodeUtil.js'], function (___baseIsRegExp_js, ___baseUnary_js, ___nodeUtil_js) { 'use strict';

	/* Node.js helper references. */
	var nodeIsRegExp = ___nodeUtil_js.default && ___nodeUtil_js.default.isRegExp;

	/**
	 * Checks if `value` is classified as a `RegExp` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.1.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
	 * @example
	 *
	 * _.isRegExp(/abc/);
	 * // => true
	 *
	 * _.isRegExp('/abc/');
	 * // => false
	 */
	var isRegExp = nodeIsRegExp ? ___baseUnary_js.default(nodeIsRegExp) : ___baseIsRegExp_js.default;

	return isRegExp;

});
