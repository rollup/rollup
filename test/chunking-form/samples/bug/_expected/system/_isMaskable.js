System.register(['./_coreJsData.js', './isFunction.js', './stubFalse.js'], function (exports, module) {
	'use strict';
	var coreJsData, isFunction, stubFalse;
	return {
		setters: [function (module) {
			coreJsData = module.default;
		}, function (module) {
			isFunction = module.default;
		}, function (module) {
			stubFalse = module.default;
		}],
		execute: function () {

			/**
			 * Checks if `func` is capable of being masked.
			 *
			 * @private
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `func` is maskable, else `false`.
			 */
			var isMaskable = coreJsData ? isFunction : stubFalse;
			exports('default', isMaskable);

		}
	};
});
