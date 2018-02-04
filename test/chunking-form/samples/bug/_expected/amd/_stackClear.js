define(['./_ListCache.js'], function (___ListCache_js) { 'use strict';

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = new ___ListCache_js.default;
    this.size = 0;
  }

  return stackClear;

});
