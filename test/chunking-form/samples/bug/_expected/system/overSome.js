System.register(['./_arraySome.js', './_createOver.js'], function (exports, module) {
	'use strict';
	var arraySome, createOver;
	return {
		setters: [function (module) {
			arraySome = module.default;
		}, function (module) {
			createOver = module.default;
		}],
		execute: function () {

			/**
			 * Creates a function that checks if **any** of the `predicates` return
			 * truthy when invoked with the arguments it receives.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Util
			 * @param {...(Function|Function[])} [predicates=[_.identity]]
			 *  The predicates to check.
			 * @returns {Function} Returns the new function.
			 * @example
			 *
			 * var func = _.overSome([Boolean, isFinite]);
			 *
			 * func('1');
			 * // => true
			 *
			 * func(null);
			 * // => true
			 *
			 * func(NaN);
			 * // => false
			 */
			var overSome = createOver(arraySome);
			exports('default', overSome);

		}
	};
});
