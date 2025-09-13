define(['exports', './generated-deps2and3'], (function (exports, deps2and3) { 'use strict';

  function fn$1 () {
    console.log('dep1 fn');
  }

  function fn () {
    console.log('lib2 fn');
  }

  class Main {
    constructor () {
      fn$1();
      deps2and3.fn();
      deps2and3.fn$1();
    }
  }

  exports.Main = Main;
  exports.fn = fn;

}));
