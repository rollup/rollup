'use strict';

var ___baseCreate_js = require('./_baseCreate.js');
var ___baseLodash_js = require('./_baseLodash.js');

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

module.exports = LodashWrapper;
