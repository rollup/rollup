define(['./generated-dep1'], (function (dep1) { 'use strict';

  class Main1 {
    constructor () {
      dep1.fn();
      console.log(dep1.text);
    }
  }

  return Main1;

}));
