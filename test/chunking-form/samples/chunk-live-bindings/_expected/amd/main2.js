define(['./generated-dep1'], function (dep1) { 'use strict';

  class Main2 {
    constructor () {
      dep1.fn$1();
      console.log(dep1.text$1);
    }
  }

  return Main2;

});
