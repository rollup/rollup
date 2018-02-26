System.register(['./_baseSetToString.js', './_shortOut.js'], function (exports, module) {
	'use strict';
	var baseSetToString, shortOut;
	return {
		setters: [function (module) {
			baseSetToString = module.default;
		}, function (module) {
			shortOut = module.default;
		}],
		execute: function () {

			/**
			 * Sets the `toString` method of `func` to return `string`.
			 *
			 * @private
			 * @param {Function} func The function to modify.
			 * @param {Function} string The `toString` result.
			 * @returns {Function} Returns `func`.
			 */
			var setToString = shortOut(baseSetToString);
			exports('default', setToString);

		}
	};
});
