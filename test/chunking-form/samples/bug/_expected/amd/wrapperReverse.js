define(['./_LazyWrapper.js', './_LodashWrapper.js', './reverse.js', './thru.js'], function (___LazyWrapper_js, ___LodashWrapper_js, __reverse_js, __thru_js) { 'use strict';

  /**
   * This method is the wrapper version of `_.reverse`.
   *
   * **Note:** This method mutates the wrapped array.
   *
   * @name reverse
   * @memberOf _
   * @since 0.1.0
   * @category Seq
   * @returns {Object} Returns the new `lodash` wrapper instance.
   * @example
   *
   * var array = [1, 2, 3];
   *
   * _(array).reverse().value()
   * // => [3, 2, 1]
   *
   * console.log(array);
   * // => [3, 2, 1]
   */
  function wrapperReverse() {
    var value = this.__wrapped__;
    if (value instanceof ___LazyWrapper_js.default) {
      var wrapped = value;
      if (this.__actions__.length) {
        wrapped = new ___LazyWrapper_js.default(this);
      }
      wrapped = wrapped.reverse();
      wrapped.__actions__.push({
        'func': __thru_js.default,
        'args': [__reverse_js.default],
        'thisArg': undefined
      });
      return new ___LodashWrapper_js.default(wrapped, this.__chain__);
    }
    return this.thru(__reverse_js.default);
  }

  return wrapperReverse;

});
