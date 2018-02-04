'use strict';

var ___baseGetAllKeys_js = require('./_baseGetAllKeys.js');
var ___getSymbolsIn_js = require('./_getSymbolsIn.js');
var __keysIn_js = require('./keysIn.js');

/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return ___baseGetAllKeys_js.default(object, __keysIn_js.default, ___getSymbolsIn_js.default);
}

module.exports = getAllKeysIn;
