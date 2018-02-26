define(['./_baseFindKey.js', './_baseForOwnRight.js', './_baseIteratee.js'], function (___baseFindKey_js, ___baseForOwnRight_js, ___baseIteratee_js) { 'use strict';

  /**
   * This method is like `_.findKey` except that it iterates over elements of
   * a collection in the opposite order.
   *
   * @static
   * @memberOf _
   * @since 2.0.0
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
   * _.findLastKey(users, function(o) { return o.age < 40; });
   * // => returns 'pebbles' assuming `_.findKey` returns 'barney'
   *
   * // The `_.matches` iteratee shorthand.
   * _.findLastKey(users, { 'age': 36, 'active': true });
   * // => 'barney'
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.findLastKey(users, ['active', false]);
   * // => 'fred'
   *
   * // The `_.property` iteratee shorthand.
   * _.findLastKey(users, 'active');
   * // => 'pebbles'
   */
  function findLastKey(object, predicate) {
    return ___baseFindKey_js.default(object, ___baseIteratee_js.default(predicate, 3), ___baseForOwnRight_js.default);
  }

  return findLastKey;

});
