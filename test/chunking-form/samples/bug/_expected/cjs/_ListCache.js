'use strict';

var ___listCacheClear_js = require('./_listCacheClear.js');
var ___listCacheDelete_js = require('./_listCacheDelete.js');
var ___listCacheGet_js = require('./_listCacheGet.js');
var ___listCacheHas_js = require('./_listCacheHas.js');
var ___listCacheSet_js = require('./_listCacheSet.js');

/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = ___listCacheClear_js.default;
ListCache.prototype['delete'] = ___listCacheDelete_js.default;
ListCache.prototype.get = ___listCacheGet_js.default;
ListCache.prototype.has = ___listCacheHas_js.default;
ListCache.prototype.set = ___listCacheSet_js.default;

module.exports = ListCache;
