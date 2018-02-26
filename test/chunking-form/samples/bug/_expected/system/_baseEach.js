System.register(['./_baseForOwn.js', './_createBaseEach.js'], function (exports, module) {
	'use strict';
	var baseForOwn, createBaseEach;
	return {
		setters: [function (module) {
			baseForOwn = module.default;
		}, function (module) {
			createBaseEach = module.default;
		}],
		execute: function () {

			/**
			 * The base implementation of `_.forEach` without support for iteratee shorthands.
			 *
			 * @private
			 * @param {Array|Object} collection The collection to iterate over.
			 * @param {Function} iteratee The function invoked per iteration.
			 * @returns {Array|Object} Returns `collection`.
			 */
			var baseEach = createBaseEach(baseForOwn);
			exports('default', baseEach);

		}
	};
});
