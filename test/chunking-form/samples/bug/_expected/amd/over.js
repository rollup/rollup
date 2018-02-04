define(['./_arrayMap.js', './_createOver.js'], function (___arrayMap_js, ___createOver_js) { 'use strict';

	/**
	 * Creates a function that invokes `iteratees` with the arguments it receives
	 * and returns their results.
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Util
	 * @param {...(Function|Function[])} [iteratees=[_.identity]]
	 *  The iteratees to invoke.
	 * @returns {Function} Returns the new function.
	 * @example
	 *
	 * var func = _.over([Math.max, Math.min]);
	 *
	 * func(1, 2, 3, 4);
	 * // => [4, 1]
	 */
	var over = ___createOver_js.default(___arrayMap_js.default);

	return over;

});
