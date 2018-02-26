System.register(['./_baseIsArrayBuffer.js', './_baseUnary.js', './_nodeUtil.js'], function (exports, module) {
	'use strict';
	var baseIsArrayBuffer, baseUnary, nodeUtil;
	return {
		setters: [function (module) {
			baseIsArrayBuffer = module.default;
		}, function (module) {
			baseUnary = module.default;
		}, function (module) {
			nodeUtil = module.default;
		}],
		execute: function () {

			/* Node.js helper references. */
			var nodeIsArrayBuffer = nodeUtil && nodeUtil.isArrayBuffer;

			/**
			 * Checks if `value` is classified as an `ArrayBuffer` object.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.3.0
			 * @category Lang
			 * @param {*} value The value to check.
			 * @returns {boolean} Returns `true` if `value` is an array buffer, else `false`.
			 * @example
			 *
			 * _.isArrayBuffer(new ArrayBuffer(2));
			 * // => true
			 *
			 * _.isArrayBuffer(new Array(2));
			 * // => false
			 */
			var isArrayBuffer = nodeIsArrayBuffer ? baseUnary(nodeIsArrayBuffer) : baseIsArrayBuffer;
			exports('isArrayBuffer', isArrayBuffer);

		}
	};
});
