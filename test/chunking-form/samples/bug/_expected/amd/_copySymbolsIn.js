define(['./_copyObject.js', './_getSymbolsIn.js'], function (___copyObject_js, ___getSymbolsIn_js) { 'use strict';

  /**
   * Copies own and inherited symbols of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy symbols from.
   * @param {Object} [object={}] The object to copy symbols to.
   * @returns {Object} Returns `object`.
   */
  function copySymbolsIn(source, object) {
    return ___copyObject_js.default(source, ___getSymbolsIn_js.default(source), object);
  }

  return copySymbolsIn;

});
