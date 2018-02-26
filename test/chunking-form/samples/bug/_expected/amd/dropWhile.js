define(['./_baseIteratee.js', './_baseWhile.js'], function (___baseIteratee_js, ___baseWhile_js) { 'use strict';

  /**
   * Creates a slice of `array` excluding elements dropped from the beginning.
   * Elements are dropped until `predicate` returns falsey. The predicate is
   * invoked with three arguments: (value, index, array).
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Array
   * @param {Array} array The array to query.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @returns {Array} Returns the slice of `array`.
   * @example
   *
   * var users = [
   *   { 'user': 'barney',  'active': false },
   *   { 'user': 'fred',    'active': false },
   *   { 'user': 'pebbles', 'active': true }
   * ];
   *
   * _.dropWhile(users, function(o) { return !o.active; });
   * // => objects for ['pebbles']
   *
   * // The `_.matches` iteratee shorthand.
   * _.dropWhile(users, { 'user': 'barney', 'active': false });
   * // => objects for ['fred', 'pebbles']
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.dropWhile(users, ['active', false]);
   * // => objects for ['pebbles']
   *
   * // The `_.property` iteratee shorthand.
   * _.dropWhile(users, 'active');
   * // => objects for ['barney', 'fred', 'pebbles']
   */
  function dropWhile(array, predicate) {
    return (array && array.length)
      ? ___baseWhile_js.default(array, ___baseIteratee_js.default(predicate, 3), true)
      : [];
  }

  return dropWhile;

});
