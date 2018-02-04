define(['./_hashClear.js', './_hashDelete.js', './_hashGet.js', './_hashHas.js', './_hashSet.js'], function (___hashClear_js, ___hashDelete_js, ___hashGet_js, ___hashHas_js, ___hashSet_js) { 'use strict';

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

  return Hash;

});
