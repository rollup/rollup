define(['./_basePick.js', './_flatRest.js'], function (___basePick_js, ___flatRest_js) { 'use strict';

  /**
   * Creates an object composed of the picked `object` properties.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The source object.
   * @param {...(string|string[])} [paths] The property paths to pick.
   * @returns {Object} Returns the new object.
   * @example
   *
   * var object = { 'a': 1, 'b': '2', 'c': 3 };
   *
   * _.pick(object, ['a', 'c']);
   * // => { 'a': 1, 'c': 3 }
   */
  var pick = ___flatRest_js.default(function(object, paths) {
    return object == null ? {} : ___basePick_js.default(object, paths);
  });

  return pick;

});
