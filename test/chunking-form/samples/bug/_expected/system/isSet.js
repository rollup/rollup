System.register(['./_baseIsSet.js', './_baseUnary.js', './_nodeUtil.js'], function (exports, module) {
	'use strict';
	var baseIsSet, baseUnary, nodeUtil;
	return {
		setters: [function (module) {
			baseIsSet = module.default;
		}, function (module) {
			baseUnary = module.default;
		}, function (module) {
			nodeUtil = module.default;
		}],
		execute: function () {

			/* Node.js helper references. */
			var nodeIsSet = nodeUtil && nodeUtil.isSet;

			/**
			 * Checks if `value` is classified as a `Set` object.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.3.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
			 * @example
			 *
			 * _.isSet(new Set);
			 * // => true
			 *
			 * _.isSet(new WeakSet);
			 * // => false
			 */
			var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
			exports('isSet', isSet);

		}
	};
});
