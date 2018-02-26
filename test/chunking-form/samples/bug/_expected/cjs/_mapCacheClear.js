'use strict';

var ___Hash_js = require('./_Hash.js');
var ___ListCache_js = require('./_ListCache.js');
var ___Map_js = require('./_Map.js');

/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new ___Hash_js.default,
    'map': new (___Map_js.default || ___ListCache_js.default),
    'string': new ___Hash_js.default
  };
}

module.exports = mapCacheClear;
