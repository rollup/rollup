System.register(['./_baseIteratee.js', './_baseSortedUniq.js'], function (exports, module) {
  'use strict';
  var baseIteratee, baseSortedUniq;
  return {
    setters: [function (module) {
      baseIteratee = module.default;
    }, function (module) {
      baseSortedUniq = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.uniqBy` except that it's designed and optimized
       * for sorted arrays.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {Function} [iteratee] The iteratee invoked per element.
       * @returns {Array} Returns the new duplicate free array.
       * @example
       *
       * _.sortedUniqBy([1.1, 1.2, 2.3, 2.4], Math.floor);
       * // => [1.1, 2.3]
       */
      function sortedUniqBy(array, iteratee) {
        return (array && array.length)
          ? baseSortedUniq(array, baseIteratee(iteratee, 2))
          : [];
      }
      exports('default', sortedUniqBy);

    }
  };
});
