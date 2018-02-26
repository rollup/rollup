define(['./_isKeyable.js'], function (___isKeyable_js) { 'use strict';

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return ___isKeyable_js.default(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  return getMapData;

});
