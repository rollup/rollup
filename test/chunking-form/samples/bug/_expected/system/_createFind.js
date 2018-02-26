System.register(['./_baseIteratee.js', './isArrayLike.js', './keys.js'], function (exports, module) {
  'use strict';
  var baseIteratee, isArrayLike, keys;
  return {
    setters: [function (module) {
      baseIteratee = module.default;
    }, function (module) {
      isArrayLike = module.default;
    }, function (module) {
      keys = module.default;
    }],
    execute: function () {

      /**
       * Creates a `_.find` or `_.findLast` function.
       *
       * @private
       * @param {Function} findIndexFunc The function to find the collection index.
       * @returns {Function} Returns the new find function.
       */
      function createFind(findIndexFunc) {
        return function(collection, predicate, fromIndex) {
          var iterable = Object(collection);
          if (!isArrayLike(collection)) {
            var iteratee = baseIteratee(predicate, 3);
            collection = keys(collection);
            predicate = function(key) { return iteratee(iterable[key], key, iterable); };
          }
          var index = findIndexFunc(collection, predicate, fromIndex);
          return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
        };
      }
      exports('default', createFind);

    }
  };
});
