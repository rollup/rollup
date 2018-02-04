System.register(['./_LazyWrapper.js', './_arrayPush.js', './_arrayReduce.js'], function (exports, module) {
  'use strict';
  var LazyWrapper, arrayPush, arrayReduce;
  return {
    setters: [function (module) {
      LazyWrapper = module.default;
    }, function (module) {
      arrayPush = module.default;
    }, function (module) {
      arrayReduce = module.default;
    }],
    execute: function () {

      /**
       * The base implementation of `wrapperValue` which returns the result of
       * performing a sequence of actions on the unwrapped `value`, where each
       * successive action is supplied the return value of the previous.
       *
       * @private
       * @param {*} value The unwrapped value.
       * @param {Array} actions Actions to perform to resolve the unwrapped value.
       * @returns {*} Returns the resolved value.
       */
      function baseWrapperValue(value, actions) {
        var result = value;
        if (result instanceof LazyWrapper) {
          result = result.value();
        }
        return arrayReduce(actions, function(result, action) {
          return action.func.apply(action.thisArg, arrayPush([result], action.args));
        }, result);
      }
      exports('default', baseWrapperValue);

    }
  };
});
