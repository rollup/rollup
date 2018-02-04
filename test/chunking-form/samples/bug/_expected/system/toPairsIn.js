System.register(['./_createToPairs.js', './keysIn.js'], function (exports, module) {
	'use strict';
	var createToPairs, keysIn$1;
	return {
		setters: [function (module) {
			createToPairs = module.default;
		}, function (module) {
			keysIn$1 = module.default;
		}],
		execute: function () {

			/**
			 * Creates an array of own and inherited enumerable string keyed-value pairs
			 * for `object` which can be consumed by `_.fromPairs`. If `object` is a map
			 * or set, its entries are returned.
			 *
			 * @static
			 * @memberOf _
			 * @since 4.0.0
			 * @alias entriesIn
			 * @category Object
			 * @param {Object} object The object to query.
			 * @returns {Array} Returns the key-value pairs.
			 * @example
			 *
			 * function Foo() {
			 *   this.a = 1;
			 *   this.b = 2;
			 * }
			 *
			 * Foo.prototype.c = 3;
			 *
			 * _.toPairsIn(new Foo);
			 * // => [['a', 1], ['b', 2], ['c', 3]] (iteration order is not guaranteed)
			 */
			var toPairsIn = createToPairs(keysIn$1);
			exports('default', toPairsIn);

		}
	};
});
