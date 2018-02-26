'use strict';

var ___copyObject_js = require('./_copyObject.js');
var ___getSymbolsIn_js = require('./_getSymbolsIn.js');

/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return ___copyObject_js.default(source, ___getSymbolsIn_js.default(source), object);
}

module.exports = copySymbolsIn;
