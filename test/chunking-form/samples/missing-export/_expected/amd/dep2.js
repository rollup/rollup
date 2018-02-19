define(['exports'], function (exports) { 'use strict';

  function fn3 () {
    console.log('dep2 fn3');
  }

  exports.fn3 = fn3;

  Object.defineProperty(exports, '__esModule', { value: true });

});
