define(['./_baseIsSet.js', './_baseUnary.js', './_nodeUtil.js'], function (___baseIsSet_js, ___baseUnary_js, ___nodeUtil_js) { 'use strict';

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

	return isSet;

});
