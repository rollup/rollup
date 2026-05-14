System.register(['./generated-deps2and3.js', './generated-lib1.js'], (function (exports) {
  'use strict';
  var fn$1, fn$2;
  return {
    setters: [function (module) {
      fn$1 = module.f;
      fn$2 = module.a;
    }, null],
    execute: (function () {

      function fn () {
        console.log('dep1 fn');
      }

      class Main {
        constructor () {
          fn();
          fn$1();
          fn$2();
        }
      } exports("default", Main);

    })
  };
}));
