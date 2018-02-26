define(['./_assocIndexOf.js'], function (___assocIndexOf_js) { 'use strict';

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = ___assocIndexOf_js.default(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  return listCacheGet;

});
