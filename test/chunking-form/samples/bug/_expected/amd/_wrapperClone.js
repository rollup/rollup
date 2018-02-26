define(['./_LazyWrapper.js', './_LodashWrapper.js', './_copyArray.js'], function (___LazyWrapper_js, ___LodashWrapper_js, ___copyArray_js) { 'use strict';

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

  return wrapperClone;

});
