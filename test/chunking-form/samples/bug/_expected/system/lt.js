System.register(['./_baseLt.js', './_createRelationalOperation.js'], function (exports, module) {
	'use strict';
	var baseLt, createRelationalOperation;
	return {
		setters: [function (module) {
			baseLt = module.default;
		}, function (module) {
			createRelationalOperation = module.default;
		}],
		execute: function () {

			/**
			 * Checks if `value` is less than `other`.
			 *
			 * @static
			 * @memberOf _
			 * @since 3.9.0
			 * @category Lang
			 * @param {*} value The value to compare.
			 * @param {*} other The other value to compare.
			 * @returns {boolean} Returns `true` if `value` is less than `other`,
			 *  else `false`.
			 * @see _.gt
			 * @example
			 *
			 * _.lt(1, 3);
			 * // => true
			 *
			 * _.lt(3, 3);
			 * // => false
			 *
			 * _.lt(3, 1);
			 * // => false
			 */
			var lt = createRelationalOperation(baseLt);
			exports('default', lt);

		}
	};
});
