System.register(['./_arrayAggregator.js', './_baseAggregator.js', './_baseIteratee.js', './isArray.js'], function (exports, module) {
  'use strict';
  var arrayAggregator, baseAggregator, baseIteratee, isArray;
  return {
    setters: [function (module) {
      arrayAggregator = module.default;
    }, function (module) {
      baseAggregator = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

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
          var func = isArray(collection) ? arrayAggregator : baseAggregator,
              accumulator = initializer ? initializer() : {};

          return func(collection, setter, baseIteratee(iteratee, 2), accumulator);
        };
      }
      exports('default', createAggregator);

    }
  };
});
