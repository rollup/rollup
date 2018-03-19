define(['exports', '../lib/lib2.js'], function (exports, __chunk_2) { 'use strict';

  function fn () {
    __chunk_2.fn();
    console.log('dep2 fn');
  }

  exports.fn = fn;

});
