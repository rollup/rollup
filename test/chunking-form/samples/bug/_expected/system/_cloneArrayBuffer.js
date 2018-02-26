System.register(['./_Uint8Array.js'], function (exports, module) {
  'use strict';
  var Uint8Array;
  return {
    setters: [function (module) {
      Uint8Array = module.default;
    }],
    execute: function () {

      /**
       * Creates a clone of `arrayBuffer`.
       *
       * @private
       * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
       * @returns {ArrayBuffer} Returns the cloned array buffer.
       */
      function cloneArrayBuffer(arrayBuffer) {
        var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
        new Uint8Array(result).set(new Uint8Array(arrayBuffer));
        return result;
      }
      exports('default', cloneArrayBuffer);

    }
  };
});
