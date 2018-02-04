System.register(['./_baseInvoke.js', './_baseRest.js'], function (exports, module) {
	'use strict';
	var baseInvoke, baseRest;
	return {
		setters: [function (module) {
			baseInvoke = module.default;
		}, function (module) {
			baseRest = module.default;
		}],
		execute: function () {

			/**
			 * Invokes the method at `path` of `object`.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @category Object
			 * @param {Object} object The object to query.
			 * @param {Array|string} path The path of the method to invoke.
			 * @param {...*} [args] The arguments to invoke the method with.
			 * @returns {*} Returns the result of the invoked method.
			 * @example
			 *
			 * var object = { 'a': [{ 'b': { 'c': [1, 2, 3, 4] } }] };
			 *
			 * _.invoke(object, 'a[0].b.c.slice', 1, 3);
			 * // => [2, 3]
			 */
			var invoke = baseRest(baseInvoke);
			exports('invoke', invoke);

		}
	};
});
