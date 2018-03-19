define(['./chunk-b663d499.js'], function (__chunk_11) { 'use strict';

  function fn () {
    console.log('lib1 fn');
  }

  function fn$1 () {
    fn();
    console.log('dep3 fn');
  }

  class Main2 {
    constructor () {
      fn$1();
      __chunk_11.fn();
    }
  }

  return Main2;

});
//# sourceMappingURL=main2.js.map
