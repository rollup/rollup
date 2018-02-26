'use strict';

var ___MapCache_js = require('./_MapCache.js');
var ___setCacheAdd_js = require('./_setCacheAdd.js');
var ___setCacheHas_js = require('./_setCacheHas.js');

/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new ___MapCache_js.default;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = ___setCacheAdd_js.default;
SetCache.prototype.has = ___setCacheHas_js.default;

module.exports = SetCache;
