'use strict';

var ___castPath_js = require('./_castPath.js');
var __last_js = require('./last.js');
var ___parent_js = require('./_parent.js');
var ___toKey_js = require('./_toKey.js');

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

module.exports = baseUnset;
