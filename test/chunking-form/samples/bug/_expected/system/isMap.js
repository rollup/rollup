System.register(['./_baseIsMap.js', './_baseUnary.js', './_nodeUtil.js'], function (exports, module) {
	'use strict';
	var baseIsMap, baseUnary, nodeUtil;
	return {
		setters: [function (module) {
			baseIsMap = module.default;
		}, function (module) {
			baseUnary = module.default;
		}, function (module) {
			nodeUtil = module.default;
		}],
		execute: function () {

			/* Node.js helper references. */
			var nodeIsMap = nodeUtil && nodeUtil.isMap;

			/**
			 * Checks if `value` is classified as a `Map` object.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.3.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
			 * @example
			 *
			 * _.isMap(new Map);
			 * // => true
			 *
			 * _.isMap(new WeakMap);
			 * // => false
			 */
			var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
			exports('isMap', isMap);

		}
	};
});
