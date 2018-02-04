define(['./_arrayAggregator.js', './_baseAggregator.js', './_baseIteratee.js', './isArray.js'], function (___arrayAggregator_js, ___baseAggregator_js, ___baseIteratee_js, __isArray_js) { 'use strict';

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

  return createAggregator;

});
