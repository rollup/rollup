define(['exports', '../lib/lib2'], function (exports, lib2) { 'use strict';

  function fn () {
    lib2.fn();
    console.log('dep2 fn');
  }

  exports.fn = fn;

  Object.defineProperty(exports, '__esModule', { value: true });

});
