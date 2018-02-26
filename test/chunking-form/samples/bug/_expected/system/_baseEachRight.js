System.register(['./_baseForOwnRight.js', './_createBaseEach.js'], function (exports, module) {
	'use strict';
	var baseForOwnRight, createBaseEach;
	return {
		setters: [function (module) {
			baseForOwnRight = module.default;
		}, function (module) {
			createBaseEach = module.default;
		}],
		execute: function () {

			/**
			 * The base implementation of `_.forEachRight` without support for iteratee shorthands.
			 *
			 * @private
			 * @param {Array|Object} collection The collection to iterate over.
			 * @param {Function} iteratee The function invoked per iteration.
			 * @returns {Array|Object} Returns `collection`.
			 */
			var baseEachRight = createBaseEach(baseForOwnRight, true);
			exports('default', baseEachRight);

		}
	};
});
