'use strict';

var ___Symbol_js = require('./_Symbol.js');

/** Used to convert symbols to primitives and strings. */
var symbolProto = ___Symbol_js.default ? ___Symbol_js.default.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

module.exports = cloneSymbol;
