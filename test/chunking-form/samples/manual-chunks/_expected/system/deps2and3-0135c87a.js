System.register(['./lib1-2ca2caed.js'], function (exports, module) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.fn;
    }],
    execute: function () {

      exports('fn', fn$2);
      exports('fn$1', fn$3);
      function fn$1 () {
        console.log('lib2 fn');
      }

      function fn$2 () {
        fn$1();
        console.log('dep2 fn');
      }

      function fn$3 () {
        fn();
        console.log('dep3 fn');
      }

    }
  };
});
