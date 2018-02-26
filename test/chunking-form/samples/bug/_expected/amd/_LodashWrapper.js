define(['./_baseCreate.js', './_baseLodash.js'], function (___baseCreate_js, ___baseLodash_js) { 'use strict';

  /**
   * The base constructor for creating `lodash` wrapper objects.
   *
   * @private
   * @param {*} value The value to wrap.
   * @param {boolean} [chainAll] Enable explicit method chain sequences.
   */
  function LodashWrapper(value, chainAll) {
    this.__wrapped__ = value;
    this.__actions__ = [];
    this.__chain__ = !!chainAll;
    this.__index__ = 0;
    this.__values__ = undefined;
  }

  LodashWrapper.prototype = ___baseCreate_js.default(___baseLodash_js.default.prototype);
  LodashWrapper.prototype.constructor = LodashWrapper;

  return LodashWrapper;

});
