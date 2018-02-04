define(['./_createCaseFirst.js'], function (___createCaseFirst_js) { 'use strict';

	/**
	 * Converts the first character of `string` to lower case.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category String
	 * @param {string} [string=''] The string to convert.
	 * @returns {string} Returns the converted string.
	 * @example
	 *
	 * _.lowerFirst('Fred');
	 * // => 'fred'
	 *
	 * _.lowerFirst('FRED');
	 * // => 'fRED'
	 */
	var lowerFirst = ___createCaseFirst_js.default('toLowerCase');

	return lowerFirst;

});
