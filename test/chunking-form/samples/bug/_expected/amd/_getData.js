define(['./_metaMap.js', './noop.js'], function (___metaMap_js, __noop_js) { 'use strict';

  /**
   * Gets metadata for `func`.
   *
   * @private
   * @param {Function} func The function to query.
   * @returns {*} Returns the metadata for `func`.
   */
  var getData = !___metaMap_js.default ? __noop_js.default : function(func) {
    return ___metaMap_js.default.get(func);
  };

  return getData;

});
