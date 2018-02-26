define(['./_baseIsArrayBuffer.js', './_baseUnary.js', './_nodeUtil.js'], function (___baseIsArrayBuffer_js, ___baseUnary_js, ___nodeUtil_js) { 'use strict';

	/* Node.js helper references. */
	var nodeIsArrayBuffer = ___nodeUtil_js.default && ___nodeUtil_js.default.isArrayBuffer;

	/**
	 * Checks if `value` is classified as an `ArrayBuffer` object.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.3.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
	 * @example
	 *
	 * _.isArrayBuffer(new ArrayBuffer(2));
	 * // => true
	 *
	 * _.isArrayBuffer(new Array(2));
	 * // => false
	 */
	var isArrayBuffer = nodeIsArrayBuffer ? ___baseUnary_js.default(nodeIsArrayBuffer) : ___baseIsArrayBuffer_js.default;

	return isArrayBuffer;

});
