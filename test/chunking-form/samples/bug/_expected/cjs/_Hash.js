'use strict';

var ___hashClear_js = require('./_hashClear.js');
var ___hashDelete_js = require('./_hashDelete.js');
var ___hashGet_js = require('./_hashGet.js');
var ___hashHas_js = require('./_hashHas.js');
var ___hashSet_js = require('./_hashSet.js');

/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = ___hashClear_js.default;
Hash.prototype['delete'] = ___hashDelete_js.default;
Hash.prototype.get = ___hashGet_js.default;
Hash.prototype.has = ___hashHas_js.default;
Hash.prototype.set = ___hashSet_js.default;

module.exports = Hash;
