'use strict';

var ___castPath_js = require('./_castPath.js');
var ___toKey_js = require('./_toKey.js');

/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = ___castPath_js.default(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[___toKey_js.default(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

module.exports = baseGet;
