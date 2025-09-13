define(['exports', './generated-main', './generated-lib1'], (function (exports, main, lib1) { 'use strict';

  function fn$1 () {
    main.fn();
    console.log('dep2 fn');
  }

  function fn () {
    lib1.fn();
    console.log('dep3 fn');
  }

  exports.fn = fn$1;
  exports.fn$1 = fn;

}));
