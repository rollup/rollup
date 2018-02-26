System.register(['./_baseIsDate.js', './_baseUnary.js', './_nodeUtil.js'], function (exports, module) {
	'use strict';
	var baseIsDate, baseUnary, nodeUtil;
	return {
		setters: [function (module) {
			baseIsDate = module.default;
		}, function (module) {
			baseUnary = module.default;
		}, function (module) {
			nodeUtil = module.default;
		}],
		execute: function () {

			/* Node.js helper references. */
			var nodeIsDate = nodeUtil && nodeUtil.isDate;

			/**
			 * Checks if `value` is classified as a `Date` object.
			 *
			 * @static
			 * @memberOf _
			 * @since 0.1.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a date object, else `false`.
			 * @example
			 *
			 * _.isDate(new Date);
			 * // => true
			 *
			 * _.isDate('Mon April 23 2012');
			 * // => false
			 */
			var isDate = nodeIsDate ? baseUnary(nodeIsDate) : baseIsDate;
			exports('isDate', isDate);

		}
	};
});
