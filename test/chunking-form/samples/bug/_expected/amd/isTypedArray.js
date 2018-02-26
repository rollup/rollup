define(['./_baseIsTypedArray.js', './_baseUnary.js', './_nodeUtil.js'], function (___baseIsTypedArray_js, ___baseUnary_js, ___nodeUtil_js) { 'use strict';

	/* Node.js helper references. */
	var nodeIsTypedArray = ___nodeUtil_js.default && ___nodeUtil_js.default.isTypedArray;

	/**
	 * Checks if `value` is classified as a typed array.
	 *
	 * @static
	 * @memberOf _
	 * @since 3.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
	 * @example
	 *
	 * _.isTypedArray(new Uint8Array);
	 * // => true
	 *
	 * _.isTypedArray([]);
	 * // => false
	 */
	var isTypedArray = nodeIsTypedArray ? ___baseUnary_js.default(nodeIsTypedArray) : ___baseIsTypedArray_js.default;

	return isTypedArray;

});
