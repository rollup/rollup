System.register(['./isArrayLike.js'], function (exports, module) {
  'use strict';
  var isArrayLike;
  return {
    setters: [function (module) {
      isArrayLike = module.default;
    }],
    execute: function () {

      /**
       * Creates a `baseEach` or `baseEachRight` function.
       *
       * @private
       * @param {Function} eachFunc The function to iterate over a collection.
       * @param {boolean} [fromRight] Specify iterating from right to left.
       * @returns {Function} Returns the new base function.
       */
      function createBaseEach(eachFunc, fromRight) {
        return function(collection, iteratee) {
          if (collection == null) {
            return collection;
          }
          if (!isArrayLike(collection)) {
            return eachFunc(collection, iteratee);
          }
          var length = collection.length,
              index = fromRight ? length : -1,
              iterable = Object(collection);

          while ((fromRight ? index-- : ++index < length)) {
            if (iteratee(iterable[index], index, iterable) === false) {
              break;
            }
          }
          return collection;
        };
      }
      exports('default', createBaseEach);

    }
  };
});
