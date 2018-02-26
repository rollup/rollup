define(['./_MapCache.js', './_setCacheAdd.js', './_setCacheHas.js'], function (___MapCache_js, ___setCacheAdd_js, ___setCacheHas_js) { 'use strict';

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

  return SetCache;

});
