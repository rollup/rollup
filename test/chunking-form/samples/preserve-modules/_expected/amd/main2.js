define(['./deps/dep2', './deps/dep3'], (function (dep2, dep3) { 'use strict';

  class Main2 {
    constructor () {
      dep3.fn();
      dep2.fn();
    }
  }

  return Main2;

}));
