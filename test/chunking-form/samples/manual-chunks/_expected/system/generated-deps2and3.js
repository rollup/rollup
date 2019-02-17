System.register(['./generated-lib1.js'], function (exports, module) {
  'use strict';
  var fn$3;
  return {
    setters: [function (module) {
      fn$3 = module.a;
    }],
    execute: function () {

      exports({
        a: fn$1,
        b: fn$2
      });

      function fn () {
        console.log('lib2 fn');
      }

      function fn$1 () {
        fn();
        console.log('dep2 fn');
      }

      function fn$2 () {
        fn$3();
        console.log('dep3 fn');
      }

    }
  };
});
