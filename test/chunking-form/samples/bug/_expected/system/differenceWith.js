System.register(['./_baseDifference.js', './_baseFlatten.js', './_baseRest.js', './isArrayLikeObject.js', './last.js'], function (exports, module) {
  'use strict';
  var baseDifference, baseFlatten, baseRest, isArrayLikeObject, last;
  return {
    setters: [function (module) {
      baseDifference = module.default;
    }, function (module) {
      baseFlatten = module.default;
    }, function (module) {
      baseRest = module.default;
    }, function (module) {
      isArrayLikeObject = module.default;
    }, function (module) {
      last = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.difference` except that it accepts `comparator`
       * which is invoked to compare elements of `array` to `values`. The order and
       * references of result values are determined by the first array. The comparator
       * is invoked with two arguments: (arrVal, othVal).
       *
       * **Note:** Unlike `_.pullAllWith`, this method returns a new array.
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {Array} array The array to inspect.
       * @param {...Array} [values] The values to exclude.
       * @param {Function} [comparator] The comparator invoked per element.
       * @returns {Array} Returns the new array of filtered values.
       * @example
       *
       * var objects = [{ 'x': 1, 'y': 2 }, { 'x': 2, 'y': 1 }];
       *
       * _.differenceWith(objects, [{ 'x': 1, 'y': 2 }], _.isEqual);
       * // => [{ 'x': 2, 'y': 1 }]
       */
      var differenceWith = baseRest(function(array, values) {
        var comparator = last(values);
        if (isArrayLikeObject(comparator)) {
          comparator = undefined;
        }
        return isArrayLikeObject(array)
          ? baseDifference(array, baseFlatten(values, 1, isArrayLikeObject, true), undefined, comparator)
          : [];
      });
      exports('default', differenceWith);

    }
  };
});
