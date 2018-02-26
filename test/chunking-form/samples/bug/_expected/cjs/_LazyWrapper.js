'use strict';

var ___baseCreate_js = require('./_baseCreate.js');
var ___baseLodash_js = require('./_baseLodash.js');

/** Used as references for the maximum length and index of an array. */
var MAX_ARRAY_LENGTH = 4294967295;

/**
 * Creates a lazy wrapper object which wraps `value` to enable lazy evaluation.
 *
 * @private
 * @constructor
 * @param {*} value The value to wrap.
 */
function LazyWrapper(value) {
  this.__wrapped__ = value;
  this.__actions__ = [];
  this.__dir__ = 1;
  this.__filtered__ = false;
  this.__iteratees__ = [];
  this.__takeCount__ = MAX_ARRAY_LENGTH;
  this.__views__ = [];
}

// Ensure `LazyWrapper` is an instance of `baseLodash`.
LazyWrapper.prototype = ___baseCreate_js.default(___baseLodash_js.default.prototype);
LazyWrapper.prototype.constructor = LazyWrapper;

module.exports = LazyWrapper;
