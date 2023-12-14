System.register(['./generated-dep2.js'], (function (exports) {
  'use strict';
  var fn$2;
  return {
    setters: [function (module) {
      fn$2 = module.f;
    }],
    execute: (function () {

      function fn$1 () {
        console.log('lib1 fn');
      }

      function fn () {
        fn$1();
        console.log('dep3 fn');
      }

      class Main2 {
        constructor () {
          fn();
          fn$2();
        }
      } exports("default", Main2);

    })
  };
}));
