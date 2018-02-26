define(['./_baseFindKey.js', './_baseForOwn.js', './_baseIteratee.js'], function (___baseFindKey_js, ___baseForOwn_js, ___baseIteratee_js) { 'use strict';

  /**
   * This method is like `_.find` except that it returns the key of the first
   * element `predicate` returns truthy for instead of the element itself.
   *
   * @static
   * @memberOf _
   * @since 1.1.0
   * @category Object
   * @param {Object} object The object to inspect.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @returns {string|undefined} Returns the key of the matched element,
   *  else `undefined`.
   * @example
   *
   * var users = {
   *   'barney':  { 'age': 36, 'active': true },
   *   'fred':    { 'age': 40, 'active': false },
   *   'pebbles': { 'age': 1,  'active': true }
   * };
   *
   * _.findKey(users, function(o) { return o.age < 40; });
   * // => 'barney' (iteration order is not guaranteed)
   *
   * // The `_.matches` iteratee shorthand.
   * _.findKey(users, { 'age': 1, 'active': true });
   * // => 'pebbles'
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.findKey(users, ['active', false]);
   * // => 'fred'
   *
   * // The `_.property` iteratee shorthand.
   * _.findKey(users, 'active');
   * // => 'barney'
   */
  function findKey(object, predicate) {
    return ___baseFindKey_js.default(object, ___baseIteratee_js.default(predicate, 3), ___baseForOwn_js.default);
  }

  return findKey;

});
