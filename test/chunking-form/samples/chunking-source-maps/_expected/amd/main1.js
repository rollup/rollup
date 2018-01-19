define(['./chunk1.js'], function (__chunk1_js) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main1 {
    constructor () {
      fn();
      __chunk1_js.fn();
    }
  }

  return Main1;

});
//# sourceMappingURL=./main1.js.map
