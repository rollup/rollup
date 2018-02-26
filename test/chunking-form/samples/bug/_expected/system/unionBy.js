System.register(['./_baseFlatten.js', './_baseIteratee.js', './_baseRest.js', './_baseUniq.js', './isArrayLikeObject.js', './last.js'], function (exports, module) {
  'use strict';
  var baseFlatten, baseIteratee, baseRest, baseUniq, isArrayLikeObject, last;
  return {
    setters: [function (module) {
      baseFlatten = module.default;
    }, function (module) {
      baseIteratee = module.default;
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
       * This method is like `_.union` except that it accepts `iteratee` which is
       * invoked for each element of each `arrays` to generate the criterion by
       * which uniqueness is computed. Result values are chosen from the first
       * array in which the value occurs. The iteratee is invoked with one argument:
       * (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Array
       * @param {...Array} [arrays] The arrays to inspect.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {Array} Returns the new array of combined values.
       * @example
       *
       * _.unionBy([2.1], [1.2, 2.3], Math.floor);
       * // => [2.1, 1.2]
       *
       * // The `_.property` iteratee shorthand.
       * _.unionBy([{ 'x': 1 }], [{ 'x': 2 }, { 'x': 1 }], 'x');
       * // => [{ 'x': 1 }, { 'x': 2 }]
       */
      var unionBy = baseRest(function(arrays) {
        var iteratee = last(arrays);
        if (isArrayLikeObject(iteratee)) {
          iteratee = undefined;
        }
        return baseUniq(baseFlatten(arrays, 1, isArrayLikeObject, true), baseIteratee(iteratee, 2));
      });
      exports('default', unionBy);

    }
  };
});
