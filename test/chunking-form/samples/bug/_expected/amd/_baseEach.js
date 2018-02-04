define(['./_baseForOwn.js', './_createBaseEach.js'], function (___baseForOwn_js, ___createBaseEach_js) { 'use strict';

	/**
	 * The base implementation of `_.forEach` without support for iteratee shorthands.
	 *
	 * @private
	 * @param {Array|Object} collection The collection to iterate over.
	 * @param {Function} iteratee The function invoked per iteration.
	 * @returns {Array|Object} Returns `collection`.
	 */
	var baseEach = ___createBaseEach_js.default(___baseForOwn_js.default);

	return baseEach;

});
