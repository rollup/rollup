System.register(['./_LazyWrapper.js'], function (exports, module) {
  'use strict';
  var LazyWrapper;
  return {
    setters: [function (module) {
      LazyWrapper = module.default;
    }],
    execute: function () {

      /**
       * Reverses the direction of lazy iteration.
       *
       * @private
       * @name reverse
       * @memberOf LazyWrapper
       * @returns {Object} Returns the new reversed `LazyWrapper` object.
       */
      function lazyReverse() {
        if (this.__filtered__) {
          var result = new LazyWrapper(this);
          result.__dir__ = -1;
          result.__filtered__ = true;
        } else {
          result = this.clone();
          result.__dir__ *= -1;
        }
        return result;
      }
      exports('default', lazyReverse);

    }
  };
});
