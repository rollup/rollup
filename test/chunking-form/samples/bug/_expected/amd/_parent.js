define(['./_baseGet.js', './_baseSlice.js'], function (___baseGet_js, ___baseSlice_js) { 'use strict';

  /**
   * Gets the parent value at `path` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {Array} path The path to get the parent value of.
   * @returns {*} Returns the parent value.
   */
  function parent(object, path) {
    return path.length < 2 ? object : ___baseGet_js.default(object, ___baseSlice_js.default(path, 0, -1));
  }

  return parent;

});
