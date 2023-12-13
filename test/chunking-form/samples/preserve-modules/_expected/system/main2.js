System.register(['./deps/dep2.js', './deps/dep3.js'], (function (exports) {
  'use strict';
  var fn$1, fn;
  return {
    setters: [function (module) {
      fn$1 = module.fn;
    }, function (module) {
      fn = module.fn;
    }],
    execute: (function () {

      class Main2 {
        constructor () {
          fn();
          fn$1();
        }
      } exports("default", Main2);

    })
  };
}));
