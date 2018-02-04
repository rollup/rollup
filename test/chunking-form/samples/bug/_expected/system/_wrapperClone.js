System.register(['./_LazyWrapper.js', './_LodashWrapper.js', './_copyArray.js'], function (exports, module) {
  'use strict';
  var LazyWrapper, LodashWrapper, copyArray;
  return {
    setters: [function (module) {
      LazyWrapper = module.default;
    }, function (module) {
      LodashWrapper = module.default;
    }, function (module) {
      copyArray = module.default;
    }],
    execute: function () {

      /**
       * Creates a clone of `wrapper`.
       *
       * @private
       * @param {Object} wrapper The wrapper to clone.
       * @returns {Object} Returns the cloned wrapper.
       */
      function wrapperClone(wrapper) {
        if (wrapper instanceof LazyWrapper) {
          return wrapper.clone();
        }
        var result = new LodashWrapper(wrapper.__wrapped__, wrapper.__chain__);
        result.__actions__ = copyArray(wrapper.__actions__);
        result.__index__  = wrapper.__index__;
        result.__values__ = wrapper.__values__;
        return result;
      }
      exports('default', wrapperClone);

    }
  };
});
