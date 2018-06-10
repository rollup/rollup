System.register(['./lib1-f3edc83a.js'], function (exports, module) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.a;
    }],
    execute: function () {

      exports({
        a: fn$2,
        b: fn$3
      });

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
