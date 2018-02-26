define(['./_baseForOwnRight.js', './_createBaseEach.js'], function (___baseForOwnRight_js, ___createBaseEach_js) { 'use strict';

	/**
	 * The base implementation of `_.forEachRight` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEachRight = ___createBaseEach_js.default(___baseForOwnRight_js.default, true);

	return baseEachRight;

});
