define(['exports', '../lib/lib1.js'], function (exports, __chunk_4) { 'use strict';

  function fn () {
    __chunk_4.fn();
    console.log('dep3 fn');
  }

  exports.fn = fn;

});
