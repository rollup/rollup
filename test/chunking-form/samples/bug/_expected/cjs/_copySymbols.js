'use strict';

var ___copyObject_js = require('./_copyObject.js');
var ___getSymbols_js = require('./_getSymbols.js');

/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return ___copyObject_js.default(source, ___getSymbols_js.default(source), object);
}

module.exports = copySymbols;
