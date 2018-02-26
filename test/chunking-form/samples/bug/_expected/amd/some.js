define(['./_arraySome.js', './_baseIteratee.js', './_baseSome.js', './isArray.js', './_isIterateeCall.js'], function (___arraySome_js, ___baseIteratee_js, ___baseSome_js, __isArray_js, ___isIterateeCall_js) { 'use strict';

  /**
   * Checks if `predicate` returns truthy for **any** element of `collection`.
   * Iteration is stopped once `predicate` returns truthy. The predicate is
   * invoked with three arguments: (value, index|key, collection).
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   * @example
   *
   * _.some([null, 0, 'yes', false], Boolean);
   * // => true
   *
   * var users = [
   *   { 'user': 'barney', 'active': true },
   *   { 'user': 'fred',   'active': false }
   * ];
   *
   * // The `_.matches` iteratee shorthand.
   * _.some(users, { 'user': 'barney', 'active': false });
   * // => false
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.some(users, ['active', false]);
   * // => true
   *
   * // The `_.property` iteratee shorthand.
   * _.some(users, 'active');
   * // => true
   */
  function some(collection, predicate, guard) {
    var func = __isArray_js.default(collection) ? ___arraySome_js.default : ___baseSome_js.default;
    if (guard && ___isIterateeCall_js.default(collection, predicate, guard)) {
      predicate = undefined;
    }
    return func(collection, ___baseIteratee_js.default(predicate, 3));
  }

  return some;

});
