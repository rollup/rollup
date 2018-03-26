define(['./chunk-96447c02.js'], function (__chunk_1) { 'use strict';

  function fn () {
    console.log('dep1 fn');
  }

  class Main1 {
    constructor () {
      fn();
      __chunk_1.fn();
    }
  }

  return Main1;

});
//# sourceMappingURL=main1.js.map
