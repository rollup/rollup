define(['./generated-deps2and3', './generated-lib1'], (function (deps2and3, lib1) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main {
    constructor () {
      fn();
      deps2and3.fn();
      deps2and3.fn$1();
    }
  }

  return Main;

}));
