define(['./_castPath.js', './last.js', './_parent.js', './_toKey.js'], function (___castPath_js, __last_js, ___parent_js, ___toKey_js) { 'use strict';

  /**
   * The base implementation of `_.unset`.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {Array|string} path The property path to unset.
   * @returns {boolean} Returns `true` if the property is deleted, else `false`.
   */
  function baseUnset(object, path) {
    path = ___castPath_js.default(path, object);
    object = ___parent_js.default(object, path);
    return object == null || delete object[___toKey_js.default(__last_js.default(path))];
  }

  return baseUnset;

});
