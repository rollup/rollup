System.register(['./_cloneArrayBuffer.js'], function (exports, module) {
  'use strict';
  var cloneArrayBuffer;
  return {
    setters: [function (module) {
      cloneArrayBuffer = module.default;
    }],
    execute: function () {

      /**
       * Creates a clone of `typedArray`.
       *
       * @private
       * @param {Object} typedArray The typed array to clone.
       * @param {boolean} [isDeep] Specify a deep clone.
       * @returns {Object} Returns the cloned typed array.
       */
      function cloneTypedArray(typedArray, isDeep) {
        var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
        return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
      }
      exports('default', cloneTypedArray);

    }
  };
});
