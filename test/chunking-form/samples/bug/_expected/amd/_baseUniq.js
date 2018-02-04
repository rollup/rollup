define(['./_SetCache.js', './_arrayIncludes.js', './_arrayIncludesWith.js', './_cacheHas.js', './_createSet.js', './_setToArray.js'], function (___SetCache_js, ___arrayIncludes_js, ___arrayIncludesWith_js, ___cacheHas_js, ___createSet_js, ___setToArray_js) { 'use strict';

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /**
   * The base implementation of `_.uniqBy` without support for iteratee shorthands.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {Function} [iteratee] The iteratee invoked per element.
   * @param {Function} [comparator] The comparator invoked per element.
   * @returns {Array} Returns the new duplicate free array.
   */
  function baseUniq(array, iteratee, comparator) {
    var index = -1,
        includes = ___arrayIncludes_js.default,
        length = array.length,
        isCommon = true,
        result = [],
        seen = result;

    if (comparator) {
      isCommon = false;
      includes = ___arrayIncludesWith_js.default;
    }
    else if (length >= LARGE_ARRAY_SIZE) {
      var set = iteratee ? null : ___createSet_js.default(array);
      if (set) {
        return ___setToArray_js.default(set);
      }
      isCommon = false;
      includes = ___cacheHas_js.default;
      seen = new ___SetCache_js.default;
    }
    else {
      seen = iteratee ? [] : result;
    }
    outer:
    while (++index < length) {
      var value = array[index],
          computed = iteratee ? iteratee(value) : value;

      value = (comparator || value !== 0) ? value : 0;
      if (isCommon && computed === computed) {
        var seenIndex = seen.length;
        while (seenIndex--) {
          if (seen[seenIndex] === computed) {
            continue outer;
          }
        }
        if (iteratee) {
          seen.push(computed);
        }
        result.push(value);
      }
      else if (!includes(seen, computed, comparator)) {
        if (seen !== result) {
          seen.push(computed);
        }
        result.push(value);
      }
    }
    return result;
  }

  return baseUniq;

});
