System.register(['./generated-deps2and3.js'], (function (exports) {
  'use strict';
  var fn$2, fn$3;
  return {
    setters: [function (module) {
      fn$2 = module.f;
      fn$3 = module.a;
    }],
    execute: (function () {

      exports("f", fn);

      function fn$1 () {
        console.log('dep1 fn');
      }

      function fn () {
        console.log('lib2 fn');
      }

      class Main {
        constructor () {
          fn$1();
          fn$2();
          fn$3();
        }
      } exports("M", Main);

    })
  };
}));
