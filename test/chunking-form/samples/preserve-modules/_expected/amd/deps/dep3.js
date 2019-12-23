define(['exports', '../lib/lib1'], function (exports, lib1) { 'use strict';

  function fn () {
    lib1.fn();
    console.log('dep3 fn');
  }

  exports.fn = fn;

  Object.defineProperty(exports, '__esModule', { value: true });

});
