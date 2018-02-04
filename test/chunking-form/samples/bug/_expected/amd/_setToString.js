define(['./_baseSetToString.js', './_shortOut.js'], function (___baseSetToString_js, ___shortOut_js) { 'use strict';

	/**
	 * Sets the `toString` method of `func` to return `string`.
	 *
	 * @private
	 * @param {Function} func The function to modify.
	 * @param {Function} string The `toString` result.
	 * @returns {Function} Returns `func`.
	 */
	var setToString = ___shortOut_js.default(___baseSetToString_js.default);

	return setToString;

});
