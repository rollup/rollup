'use strict';

var ___ListCache_js = require('./_ListCache.js');

/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new ___ListCache_js.default;
  this.size = 0;
}

module.exports = stackClear;
