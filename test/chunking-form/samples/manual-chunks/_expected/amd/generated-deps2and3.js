define(['exports', './generated-lib1.js'], function (exports, __chunk_2) { 'use strict';

  function fn () {
    console.log('lib2 fn');
  }

  function fn$1 () {
    fn();
    console.log('dep2 fn');
  }

  function fn$2 () {
    __chunk_2.fn();
    console.log('dep3 fn');
  }

  exports.fn = fn$1;
  exports.fn$1 = fn$2;

});
