define(['./_baseGet.js', './_baseSet.js', './_castPath.js'], function (___baseGet_js, ___baseSet_js, ___castPath_js) { 'use strict';

  /**
   * The base implementation of  `_.pickBy` without support for iteratee shorthands.
   *
   * @private
   * @param {Object} object The source object.
   * @param {string[]} paths The property paths to pick.
   * @param {Function} predicate The function invoked per property.
   * @returns {Object} Returns the new object.
   */
  function basePickBy(object, paths, predicate) {
    var index = -1,
        length = paths.length,
        result = {};

    while (++index < length) {
      var path = paths[index],
          value = ___baseGet_js.default(object, path);

      if (predicate(value, path)) {
        ___baseSet_js.default(result, ___castPath_js.default(path, object), value);
      }
    }
    return result;
  }

  return basePickBy;

});
