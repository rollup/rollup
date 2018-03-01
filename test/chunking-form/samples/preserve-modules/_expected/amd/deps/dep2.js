define(['exports', '../lib/lib2.js'], function (exports, __lib_lib2_js) { 'use strict';

  function fn () {
    __lib_lib2_js.fn();
    console.log('dep2 fn');
  }

  exports.fn = fn;

});
