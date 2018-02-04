System.register(['./_LazyWrapper.js', './_LodashWrapper.js', './reverse.js', './thru.js'], function (exports, module) {
  'use strict';
  var LazyWrapper, LodashWrapper, reverse, thru;
  return {
    setters: [function (module) {
      LazyWrapper = module.default;
    }, function (module) {
      LodashWrapper = module.default;
    }, function (module) {
      reverse = module.default;
    }, function (module) {
      thru = module.default;
    }],
    execute: function () {

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
        if (value instanceof LazyWrapper) {
          var wrapped = value;
          if (this.__actions__.length) {
            wrapped = new LazyWrapper(this);
          }
          wrapped = wrapped.reverse();
          wrapped.__actions__.push({
            'func': thru,
            'args': [reverse],
            'thisArg': undefined
          });
          return new LodashWrapper(wrapped, this.__chain__);
        }
        return this.thru(reverse);
      }
      exports('default', wrapperReverse);

    }
  };
});
