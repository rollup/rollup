'use strict';

var ___arrayPush_js = require('./_arrayPush.js');
var ___getPrototype_js = require('./_getPrototype.js');
var ___getSymbols_js = require('./_getSymbols.js');
var __stubArray_js = require('./stubArray.js');

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !nativeGetSymbols ? __stubArray_js.default : function(object) {
  var result = [];
  while (object) {
    ___arrayPush_js.default(result, ___getSymbols_js.default(object));
    object = ___getPrototype_js.default(object);
  }
  return result;
};

module.exports = getSymbolsIn;
