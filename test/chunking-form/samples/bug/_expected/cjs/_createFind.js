'use strict';

var ___baseIteratee_js = require('./_baseIteratee.js');
var __isArrayLike_js = require('./isArrayLike.js');
var __keys_js = require('./keys.js');

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

module.exports = createFind;
