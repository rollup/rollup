define(['./generated-dep2'], (function (dep2) { 'use strict';

  function fn$1 () {
    console.log('lib1 fn');
  }

  function fn () {
    fn$1();
    console.log('dep3 fn');
  }

  class Main2 {
    constructor () {
      fn();
      dep2.fn();
    }
  }

  return Main2;

}));
