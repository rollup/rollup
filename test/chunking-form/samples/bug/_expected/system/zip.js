System.register(['./_baseRest.js', './unzip.js'], function (exports, module) {
	'use strict';
	var baseRest, unzip;
	return {
		setters: [function (module) {
			baseRest = module.default;
		}, function (module) {
			unzip = module.default;
		}],
		execute: function () {

			/**
			 * Creates an array of grouped elements, the first of which contains the
			 * first elements of the given arrays, the second of which contains the
			 * second elements of the given arrays, and so on.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Array
			 * @param {...Array} [arrays] The arrays to process.
			 * @returns {Array} Returns the new array of grouped elements.
			 * @example
			 *
			 * _.zip(['a', 'b'], [1, 2], [true, false]);
			 * // => [['a', 1, true], ['b', 2, false]]
			 */
			var zip = baseRest(unzip);
			exports('default', zip);

		}
	};
});
