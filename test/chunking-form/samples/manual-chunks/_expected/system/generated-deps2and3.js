System.register(['./generated-lib1.js'], function (exports) {
  'use strict';
  var fn$3;
  return {
    setters: [function (module) {
      fn$3 = module.f;
    }],
    execute: function () {

      exports({
        a: fn,
        f: fn$1
      });

      function fn$2 () {
        console.log('lib2 fn');
      }

      function fn$1 () {
        fn$2();
        console.log('dep2 fn');
      }

      function fn () {
        fn$3();
        console.log('dep3 fn');
      }

    }
  };
});
