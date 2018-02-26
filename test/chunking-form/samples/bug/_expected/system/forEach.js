System.register(['./_arrayEach.js', './_baseEach.js', './_castFunction.js', './isArray.js'], function (exports, module) {
  'use strict';
  var arrayEach, baseEach, castFunction, isArray;
  return {
    setters: [function (module) {
      arrayEach = module.default;
    }, function (module) {
      baseEach = module.default;
    }, function (module) {
      castFunction = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

      /**
       * Iterates over elements of `collection` and invokes `iteratee` for each element.
       * The iteratee is invoked with three arguments: (value, index|key, collection).
       * Iteratee functions may exit iteration early by explicitly returning `false`.
       *
       * **Note:** As with other "Collections" methods, objects with a "length"
       * property are iterated like arrays. To avoid this behavior use `_.forIn`
       * or `_.forOwn` for object iteration.
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @alias each
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Array|Object} Returns `collection`.
       * @see _.forEachRight
       * @example
       *
       * _.forEach([1, 2], function(value) {
       *   console.log(value);
       * });
       * // => Logs `1` then `2`.
       *
       * _.forEach({ 'a': 1, 'b': 2 }, function(value, key) {
       *   console.log(key);
       * });
       * // => Logs 'a' then 'b' (iteration order is not guaranteed).
       */
      function forEach(collection, iteratee) {
        var func = isArray(collection) ? arrayEach : baseEach;
        return func(collection, castFunction(iteratee));
      }
      exports('default', forEach);

    }
  };
});
