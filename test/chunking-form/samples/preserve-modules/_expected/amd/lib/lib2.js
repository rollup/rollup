define(['exports'], function (exports) { 'use strict';

  function fn () {
    console.log('lib2 fn');
  }

  exports.fn = fn;

  Object.defineProperty(exports, '__esModule', { value: true });

});
