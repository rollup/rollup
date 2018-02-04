System.register(['./_baseExtremum.js', './_baseGt.js', './_baseIteratee.js'], function (exports, module) {
  'use strict';
  var baseExtremum, baseGt, baseIteratee;
  return {
    setters: [function (module) {
      baseExtremum = module.default;
    }, function (module) {
      baseGt = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }],
    execute: function () {

      /**
       * This method is like `_.max` except that it accepts `iteratee` which is
       * invoked for each element in `array` to generate the criterion by which
       * the value is ranked. The iteratee is invoked with one argument: (value).
       *
       * @static
       * @memberOf _
       * @since 4.0.0
       * @category Math
       * @param {Array} array The array to iterate over.
       * @param {Function} [iteratee=_.identity] The iteratee invoked per element.
       * @returns {*} Returns the maximum value.
       * @example
       *
       * var objects = [{ 'n': 1 }, { 'n': 2 }];
       *
       * _.maxBy(objects, function(o) { return o.n; });
       * // => { 'n': 2 }
       *
       * // The `_.property` iteratee shorthand.
       * _.maxBy(objects, 'n');
       * // => { 'n': 2 }
       */
      function maxBy(array, iteratee) {
        return (array && array.length)
          ? baseExtremum(array, baseIteratee(iteratee, 2), baseGt)
          : undefined;
      }
      exports('default', maxBy);

    }
  };
});
