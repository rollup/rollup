System.register(['./_arrayFilter.js', './_baseRest.js', './_baseXor.js', './isArrayLikeObject.js', './last.js'], function (exports, module) {
  'use strict';
  var arrayFilter, baseRest, baseXor, isArrayLikeObject, last;
  return {
    setters: [function (module) {
      arrayFilter = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      baseXor = module.default;
    }, function (module) {
      isArrayLikeObject = module.default;
    }, function (module) {
      last = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.xor` except that it accepts `comparator` which is
       * invoked to compare elements of `arrays`. The order of result values is
       * determined by the order they occur in the arrays. The comparator is invoked
       * with two arguments: (arrVal, othVal).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of filtered values.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
       * var others = [{ 'x': 1, 'y': 1 }, { 'x': 1, 'y': 2 }];
       *
       * _.xorWith(objects, others, _.isEqual);
       * // => [{ 'x': 2, 'y': 1 }, { 'x': 1, 'y': 1 }]
       */
      var xorWith = baseRest(function(arrays) {
        var comparator = last(arrays);
        comparator = typeof comparator == 'function' ? comparator : undefined;
        return baseXor(arrayFilter(arrays, isArrayLikeObject), undefined, comparator);
      });
      exports('default', xorWith);

    }
  };
});
