define(['exports', '../lib/lib1.js'], function (exports, __lib_lib1_js) { 'use strict';

  function fn () {
    __lib_lib1_js.fn();
    console.log('dep3 fn');
  }

  exports.fn = fn;

  Object.defineProperty(exports, '__esModule', { value: true });

});
