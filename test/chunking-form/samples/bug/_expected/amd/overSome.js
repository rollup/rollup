define(['./_arraySome.js', './_createOver.js'], function (___arraySome_js, ___createOver_js) { 'use strict';

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
	var overSome = ___createOver_js.default(___arraySome_js.default);

	return overSome;

});
