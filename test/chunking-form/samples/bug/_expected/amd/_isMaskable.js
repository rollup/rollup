define(['./_coreJsData.js', './isFunction.js', './stubFalse.js'], function (___coreJsData_js, __isFunction_js, __stubFalse_js) { 'use strict';

	/**
	 * Checks if `func` is capable of being masked.
	 *
	 * @private
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `func` is maskable, else `false`.
	 */
	var isMaskable = ___coreJsData_js.default ? __isFunction_js.default : __stubFalse_js.default;

	return isMaskable;

});
