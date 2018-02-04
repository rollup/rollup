System.register(['./_arrayMap.js', './_baseIntersection.js', './_baseIteratee.js', './_baseRest.js', './_castArrayLikeObject.js', './last.js'], function (exports, module) {
  'use strict';
  var arrayMap, baseIntersection, baseIteratee, baseRest, castArrayLikeObject, last;
  return {
    setters: [function (module) {
      arrayMap = module.default;
    }, function (module) {
      baseIntersection = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      castArrayLikeObject = module.default;
    }, function (module) {
      last = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.intersection` except that it accepts `iteratee`
       * which is invoked for each element of each `arrays` to generate the criterion
       * by which they're compared. The order and references of result values are
       * determined by the first array. The iteratee is invoked with one argument:
       * (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {Array} Returns the new array of intersecting values.
       * @example
       *
       * _.intersectionBy([2.1, 1.2], [2.3, 3.4], Math.floor);
       * // => [2.1]
       *
       * // The `_.property` iteratee shorthand.
       * _.intersectionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
       * // => [{ 'x': 1 }]
       */
      var intersectionBy = baseRest(function(arrays) {
        var iteratee = last(arrays),
            mapped = arrayMap(arrays, castArrayLikeObject);

        if (iteratee === last(mapped)) {
          iteratee = undefined;
        } else {
          mapped.pop();
        }
        return (mapped.length && mapped[0] === arrays[0])
          ? baseIntersection(mapped, baseIteratee(iteratee, 2))
          : [];
      });
      exports('default', intersectionBy);

    }
  };
});
