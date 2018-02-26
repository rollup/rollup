System.register(['./_createFlow.js'], function (exports, module) {
	'use strict';
	var createFlow;
	return {
		setters: [function (module) {
			createFlow = module.default;
		}],
		execute: function () {

			/**
			 * This method is like `_.flow` except that it creates a function that
			 * invokes the given functions from right to left.
			 *
			 * @static
			 * @since 3.0.0
			 * @memberOf _
			 * @category Util
			 * @param {...(Function|Function[])} [funcs] The functions to invoke.
			 * @returns {Function} Returns the new composite function.
			 * @see _.flow
			 * @example
			 *
			 * function square(n) {
			 *   return n * n;
			 * }
			 *
			 * var addSquare = _.flowRight([square, _.add]);
			 * addSquare(1, 2);
			 * // => 9
			 */
			var flowRight = createFlow(true);
			exports('flowRight', flowRight);

		}
	};
});
