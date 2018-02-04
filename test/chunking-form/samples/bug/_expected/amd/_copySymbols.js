define(['./_copyObject.js', './_getSymbols.js'], function (___copyObject_js, ___getSymbols_js) { 'use strict';

  /**
   * Copies own symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbols(source, object) {
    return ___copyObject_js.default(source, ___getSymbols_js.default(source), object);
  }

  return copySymbols;

});
