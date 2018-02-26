System.register(['./_baseIsRegExp.js', './_baseUnary.js', './_nodeUtil.js'], function (exports, module) {
	'use strict';
	var baseIsRegExp, baseUnary, nodeUtil;
	return {
		setters: [function (module) {
			baseIsRegExp = module.default;
		}, function (module) {
			baseUnary = module.default;
		}, function (module) {
			nodeUtil = module.default;
		}],
		execute: function () {

			/* Node.js helper references. */
			var nodeIsRegExp = nodeUtil && nodeUtil.isRegExp;

			/**
			 * Checks if `value` is classified as a `RegExp` object.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a regexp, else `false`.
			 * @example
			 *
			 * _.isRegExp(/abc/);
			 * // => true
			 *
			 * _.isRegExp('/abc/');
			 * // => false
			 */
			var isRegExp = nodeIsRegExp ? baseUnary(nodeIsRegExp) : baseIsRegExp;
			exports('isRegExp', isRegExp);

		}
	};
});
