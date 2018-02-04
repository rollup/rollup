System.register(['./_arrayMap.js', './_baseIteratee.js', './_baseMap.js', './isArray.js'], function (exports, module) {
  'use strict';
  var arrayMap, baseIteratee, baseMap, isArray;
  return {
    setters: [function (module) {
      arrayMap = module.default;
    }, function (module) {
      baseIteratee = module.default;
    }, function (module) {
      baseMap = module.default;
    }, function (module) {
      isArray = module.default;
    }],
    execute: function () {

      /**
       * Creates an array of values by running each element in `collection` thru
       * `iteratee`. The iteratee is invoked with three arguments:
       * (value, index|key, collection).
       *
       * Many lodash methods are guarded to work as iteratees for methods like
       * `_.every`, `_.filter`, `_.map`, `_.mapValues`, `_.reject`, and `_.some`.
       *
       * The guarded methods are:
       * `ary`, `chunk`, `curry`, `curryRight`, `drop`, `dropRight`, `every`,
       * `fill`, `invert`, `parseInt`, `random`, `range`, `rangeRight`, `repeat`,
       * `sampleSize`, `slice`, `some`, `sortBy`, `split`, `take`, `takeRight`,
       * `template`, `trim`, `trimEnd`, `trimStart`, and `words`
       *
       * @static
       * @memberOf _
       * @since 0.1.0
       * @category Collection
       * @param {Array|Object} collection The collection to iterate over.
       * @param {Function} [iteratee=_.identity] The function invoked per iteration.
       * @returns {Array} Returns the new mapped array.
       * @example
       *
       * function square(n) {
       *   return n * n;
       * }
       *
       * _.map([4, 8], square);
       * // => [16, 64]
       *
       * _.map({ 'a': 4, 'b': 8 }, square);
       * // => [16, 64] (iteration order is not guaranteed)
       *
       * var users = [
       *   { 'user': 'barney' },
       *   { 'user': 'fred' }
       * ];
       *
       * // The `_.property` iteratee shorthand.
       * _.map(users, 'user');
       * // => ['barney', 'fred']
       */
      function map(collection, iteratee) {
        var func = isArray(collection) ? arrayMap : baseMap;
        return func(collection, baseIteratee(iteratee, 3));
      }
      exports('default', map);

    }
  };
});
