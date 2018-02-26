define(['./_arrayEvery.js', './_baseEvery.js', './_baseIteratee.js', './isArray.js', './_isIterateeCall.js'], function (___arrayEvery_js, ___baseEvery_js, ___baseIteratee_js, __isArray_js, ___isIterateeCall_js) { 'use strict';

  /**
   * Checks if `predicate` returns truthy for **all** elements of `collection`.
   * Iteration is stopped once `predicate` returns falsey. The predicate is
   * invoked with three arguments: (value, index|key, collection).
   *
   * **Note:** This method returns `true` for
   * [empty collections](https://en.wikipedia.org/wiki/Empty_set) because
   * [everything is true](https://en.wikipedia.org/wiki/Vacuous_truth) of
   * elements of empty collections.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Collection
   * @param {Array|Object} collection The collection to iterate over.
   * @param {Function} [predicate=_.identity] The function invoked per iteration.
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {boolean} Returns `true` if all elements pass the predicate check,
   *  else `false`.
   * @example
   *
   * _.every([true, 1, null, 'yes'], Boolean);
   * // => false
   *
   * var users = [
   *   { 'user': 'barney', 'age': 36, 'active': false },
   *   { 'user': 'fred',   'age': 40, 'active': false }
   * ];
   *
   * // The `_.matches` iteratee shorthand.
   * _.every(users, { 'user': 'barney', 'active': false });
   * // => false
   *
   * // The `_.matchesProperty` iteratee shorthand.
   * _.every(users, ['active', false]);
   * // => true
   *
   * // The `_.property` iteratee shorthand.
   * _.every(users, 'active');
   * // => false
   */
  function every(collection, predicate, guard) {
    var func = __isArray_js.default(collection) ? ___arrayEvery_js.default : ___baseEvery_js.default;
    if (guard && ___isIterateeCall_js.default(collection, predicate, guard)) {
      predicate = undefined;
    }
    return func(collection, ___baseIteratee_js.default(predicate, 3));
  }

  return every;

});
