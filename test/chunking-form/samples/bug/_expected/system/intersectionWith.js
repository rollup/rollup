System.register(['./_arrayMap.js', './_baseIntersection.js', './_baseRest.js', './_castArrayLikeObject.js', './last.js'], function (exports, module) {
  'use strict';
  var arrayMap, baseIntersection, baseRest, castArrayLikeObject, last;
  return {
    setters: [function (module) {
      arrayMap = module.default;
    }, function (module) {
      baseIntersection = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      castArrayLikeObject = module.default;
    }, function (module) {
      last = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.intersection` except that it accepts `comparator`
       * which is invoked to compare elements of `arrays`. The order and references
       * of result values are determined by the first array. The comparator is
       * invoked with two arguments: (arrVal, othVal).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of intersecting values.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
       * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
       *
       * _.intersectionWith(objects, others, _.isEqual);
       * // => [{ 'x': 1, 'y': 2 }]
       */
      var intersectionWith = baseRest(function(arrays) {
        var comparator = last(arrays),
            mapped = arrayMap(arrays, castArrayLikeObject);

        comparator = typeof comparator == 'function' ? comparator : undefined;
        if (comparator) {
          mapped.pop();
        }
        return (mapped.length && mapped[0] === arrays[0])
          ? baseIntersection(mapped, undefined, comparator)
          : [];
      });
      exports('default', intersectionWith);

    }
  };
});
