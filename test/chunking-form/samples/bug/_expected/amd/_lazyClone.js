define(['./_LazyWrapper.js', './_copyArray.js'], function (___LazyWrapper_js, ___copyArray_js) { 'use strict';

  /**
   * Creates a clone of the lazy wrapper object.
   *
   * @private
   * @name clone
   * @memberOf LazyWrapper
   * @returns {Object} Returns the cloned `LazyWrapper` object.
   */
  function lazyClone() {
    var result = new ___LazyWrapper_js.default(this.__wrapped__);
    result.__actions__ = ___copyArray_js.default(this.__actions__);
    result.__dir__ = this.__dir__;
    result.__filtered__ = this.__filtered__;
    result.__iteratees__ = ___copyArray_js.default(this.__iteratees__);
    result.__takeCount__ = this.__takeCount__;
    result.__views__ = ___copyArray_js.default(this.__views__);
    return result;
  }

  return lazyClone;

});
