System.register(['./_baseWrapperValue.js'], function (exports, module) {
  'use strict';
  var baseWrapperValue;
  return {
    setters: [function (module) {
      baseWrapperValue = module.default;
    }],
    execute: function () {

      /**
       * Executes the chain sequence to resolve the unwrapped value.
       *
       * @name value
       * @memberOf _
       * @since 0.1.0
       * @alias toJSON, valueOf
       * @category Seq
       * @returns {*} Returns the resolved unwrapped value.
       * @example
       *
       * _([1, 2, 3]).value();
       * // => [1, 2, 3]
       */
      function wrapperValue() {
        return baseWrapperValue(this.__wrapped__, this.__actions__);
      }
      exports('default', wrapperValue);

    }
  };
});
