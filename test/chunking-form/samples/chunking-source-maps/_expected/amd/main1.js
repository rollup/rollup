define(['./generated-dep2'], (function (dep2) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main1 {
    constructor () {
      fn();
      dep2.fn();
    }
  }

  return Main1;

}));
//# sourceMappingURL=main1.js.map
