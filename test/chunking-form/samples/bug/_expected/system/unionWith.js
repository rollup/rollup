System.register(['./_baseFlatten.js', './_baseRest.js', './_baseUniq.js', './isArrayLikeObject.js', './last.js'], function (exports, module) {
  'use strict';
  var baseFlatten, baseRest, baseUniq, isArrayLikeObject, last;
  return {
    setters: [function (module) {
      baseFlatten = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      baseUniq = module.default;
    }, function (module) {
      isArrayLikeObject = module.default;
    }, function (module) {
      last = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.union` except that it accepts `comparator` which
       * is invoked to compare elements of `arrays`. Result values are chosen from
       * the first array in which the value occurs. The comparator is invoked
       * with two arguments: (arrVal, othVal).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of combined values.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
       * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
       *
       * _.unionWith(objects, others, _.isEqual);
       * // => [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
       */
      var unionWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == 'function' ? comparator : undefined;
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), undefined, comparator);
      });
      exports('default', unionWith);

    }
  };
});
