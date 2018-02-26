'use strict';

var ___baseGetAllKeys_js = require('./_baseGetAllKeys.js');
var ___getSymbols_js = require('./_getSymbols.js');
var __keys_js = require('./keys.js');

/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return ___baseGetAllKeys_js.default(object, __keys_js.default, ___getSymbols_js.default);
}

module.exports = getAllKeys;
