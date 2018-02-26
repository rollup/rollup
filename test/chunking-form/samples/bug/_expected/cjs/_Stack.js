'use strict';

var ___ListCache_js = require('./_ListCache.js');
var ___stackClear_js = require('./_stackClear.js');
var ___stackDelete_js = require('./_stackDelete.js');
var ___stackGet_js = require('./_stackGet.js');
var ___stackHas_js = require('./_stackHas.js');
var ___stackSet_js = require('./_stackSet.js');

/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new ___ListCache_js.default(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = ___stackClear_js.default;
Stack.prototype['delete'] = ___stackDelete_js.default;
Stack.prototype.get = ___stackGet_js.default;
Stack.prototype.has = ___stackHas_js.default;
Stack.prototype.set = ___stackSet_js.default;

module.exports = Stack;
