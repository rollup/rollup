System.register(['./_baseProperty.js'], function (exports, module) {
	'use strict';
	var baseProperty;
	return {
		setters: [function (module) {
			baseProperty = module.default;
		}],
		execute: function () {

			/**
			 * Gets the size of an ASCII `string`.
			 *
			 * @private
			 * @param {string} string The string inspect.
			 * @returns {number} Returns the string size.
			 */
			var asciiSize = baseProperty('length');
			exports('default', asciiSize);

		}
	};
});
