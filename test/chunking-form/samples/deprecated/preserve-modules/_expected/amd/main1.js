define(['./deps/dep1', './deps/dep2'], function (dep1, dep2) { 'use strict';

  class Main1 {
    constructor () {
      dep1.fn();
      dep2.fn();
    }
  }

  return Main1;

});
