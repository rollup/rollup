define(['./_basePickBy.js', './hasIn.js'], function (___basePickBy_js, __hasIn_js) { 'use strict';

  /**
   * The base implementation of `_.pick` without support for individual
   * property identifiers.
   *
   * @private
   * @param {Object} object The source object.
   * @param {string[]} paths The property paths to pick.
   * @returns {Object} Returns the new object.
   */
  function basePick(object, paths) {
    return ___basePickBy_js.default(object, paths, function(value, path) {
      return __hasIn_js.default(object, path);
    });
  }

  return basePick;

});
