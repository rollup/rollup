define(['./identity.js', './_metaMap.js'], function (__identity_js, ___metaMap_js) { 'use strict';

  /**
   * The base implementation of `setData` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to associate metadata with.
   * @param {*} data The metadata.
   * @returns {Function} Returns `func`.
   */
  var baseSetData = !___metaMap_js.default ? __identity_js.default : function(func, data) {
    ___metaMap_js.default.set(func, data);
    return func;
  };

  return baseSetData;

});
