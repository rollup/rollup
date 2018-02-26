System.register(['./_createCaseFirst.js'], function (exports, module) {
	'use strict';
	var createCaseFirst;
	return {
		setters: [function (module) {
			createCaseFirst = module.default;
		}],
		execute: function () {

			/**
			 * Converts the first character of `string` to upper case.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category String
			 * @param {string} [string=''] The string to convert.
			 * @returns {string} Returns the converted string.
			 * @example
			 *
			 * _.upperFirst('fred');
			 * // => 'Fred'
			 *
			 * _.upperFirst('FRED');
			 * // => 'FRED'
			 */
			var upperFirst = createCaseFirst('toUpperCase');
			exports('default', upperFirst);

		}
	};
});
