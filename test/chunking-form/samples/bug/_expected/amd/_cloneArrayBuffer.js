define(['./_Uint8Array.js'], function (___Uint8Array_js) { 'use strict';

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new ___Uint8Array_js.default(result).set(new ___Uint8Array_js.default(arrayBuffer));
    return result;
  }

  return cloneArrayBuffer;

});
