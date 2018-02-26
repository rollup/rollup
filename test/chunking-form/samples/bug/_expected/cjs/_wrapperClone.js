'use strict';

var ___LazyWrapper_js = require('./_LazyWrapper.js');
var ___LodashWrapper_js = require('./_LodashWrapper.js');
var ___copyArray_js = require('./_copyArray.js');

/**
 * Creates a clone of `wrapper`.
 *
 * @private
 * @param {Object} wrapper The wrapper to clone.
 * @returns {Object} Returns the cloned wrapper.
 */
function wrapperClone(wrapper) {
  if (wrapper instanceof ___LazyWrapper_js.default) {
    return wrapper.clone();
  }
  var result = new ___LodashWrapper_js.default(wrapper.__wrapped__, wrapper.__chain__);
  result.__actions__ = ___copyArray_js.default(wrapper.__actions__);
  result.__index__  = wrapper.__index__;
  result.__values__ = wrapper.__values__;
  return result;
}

module.exports = wrapperClone;
