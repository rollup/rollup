System.register(['./_baseEach.js'], function (exports, module) {
  'use strict';
  var baseEach;
  return {
    setters: [function (module) {
      baseEach = module.default;
    }],
    execute: function () {

      /**
       * Aggregates elements of `collection` on `accumulator` with keys transformed
       * by `iteratee` and values set by `setter`.
       *
       * @private
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} setter The function to set `accumulator` values.
       * @param {Function} iteratee The iteratee to transform keys.
       * @param {Object} accumulator The initial aggregated object.
       * @returns {Function} Returns `accumulator`.
       */
      function baseAggregator(collection, setter, iteratee, accumulator) {
        baseEach(collection, function(value, key, collection) {
          setter(accumulator, value, iteratee(value), collection);
        });
        return accumulator;
      }
      exports('default', baseAggregator);

    }
  };
});
