System.register(['../lib/lib2.js'], (function (exports) {
  'use strict';
  var fn$1;
  return {
    setters: [function (module) {
      fn$1 = module.fn;
    }],
    execute: (function () {

      exports("fn", fn);

      function fn () {
        fn$1();
        console.log('dep2 fn');
      }

    })
  };
}));
