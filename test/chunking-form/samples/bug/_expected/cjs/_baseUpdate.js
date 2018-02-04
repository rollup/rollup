'use strict';

var ___baseGet_js = require('./_baseGet.js');
var ___baseSet_js = require('./_baseSet.js');

/**
 * The base implementation of `_.update`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to update.
 * @param {Function} updater The function to produce the updated value.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseUpdate(object, path, updater, customizer) {
  return ___baseSet_js.default(object, path, updater(___baseGet_js.default(object, path)), customizer);
}

module.exports = baseUpdate;
