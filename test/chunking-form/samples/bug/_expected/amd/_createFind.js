define(['./_baseIteratee.js', './isArrayLike.js', './keys.js'], function (___baseIteratee_js, __isArrayLike_js, __keys_js) { 'use strict';

  /**
   * Creates a `_.find` or `_.findLast` function.
   *
   * @private
   * @param {Function} findIndexFunc The function to find the collection index.
   * @returns {Function} Returns the new find function.
   */
  function createFind(findIndexFunc) {
    return function(collection, predicate, fromIndex) {
      var iterable = Object(collection);
      if (!__isArrayLike_js.default(collection)) {
        var iteratee = ___baseIteratee_js.default(predicate, 3);
        collection = __keys_js.default(collection);
        predicate = function(key) { return iteratee(iterable[key], key, iterable); };
      }
      var index = findIndexFunc(collection, predicate, fromIndex);
      return index > -1 ? iterable[iteratee ? collection[index] : index] : undefined;
    };
  }

  return createFind;

});
