'use strict';

var ___baseGet_js = require('./_baseGet.js');
var ___baseSlice_js = require('./_baseSlice.js');

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

module.exports = parent;
