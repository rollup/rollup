System.register(['./_baseRest.js'], function (exports, module) {
	'use strict';
	var baseRest;
	return {
		setters: [function (module) {
			baseRest = module.default;
		}],
		execute: function () {

			/**
			 * A `baseRest` alias which can be replaced with `identity` by module
			 * replacement plugins.
			 *
			 * @private
			 * @type {Function}
			 * @param {Function} func The function to apply a rest parameter to.
			 * @returns {Function} Returns the new function.
			 */
			var castRest = baseRest;
			exports('default', castRest);

		}
	};
});
