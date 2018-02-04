'use strict';

var ___arrayAggregator_js = require('./_arrayAggregator.js');
var ___baseAggregator_js = require('./_baseAggregator.js');
var ___baseIteratee_js = require('./_baseIteratee.js');
var __isArray_js = require('./isArray.js');

/**
 * Creates a function like `_.groupBy`.
 *
 * @private
 * @param {Function} setter The function to set accumulator values.
 * @param {Function} [initializer] The accumulator object initializer.
 * @returns {Function} Returns the new aggregator function.
 */
function createAggregator(setter, initializer) {
  return function(collection, iteratee) {
    var func = __isArray_js.default(collection) ? ___arrayAggregator_js.default : ___baseAggregator_js.default,
        accumulator = initializer ? initializer() : {};

    return func(collection, setter, ___baseIteratee_js.default(iteratee, 2), accumulator);
  };
}

module.exports = createAggregator;
