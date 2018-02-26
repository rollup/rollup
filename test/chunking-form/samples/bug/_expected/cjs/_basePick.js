'use strict';

var ___basePickBy_js = require('./_basePickBy.js');
var __hasIn_js = require('./hasIn.js');

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

module.exports = basePick;
