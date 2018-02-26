define(['./_ListCache.js', './_stackClear.js', './_stackDelete.js', './_stackGet.js', './_stackHas.js', './_stackSet.js'], function (___ListCache_js, ___stackClear_js, ___stackDelete_js, ___stackGet_js, ___stackHas_js, ___stackSet_js) { 'use strict';

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

  return Stack;

});
