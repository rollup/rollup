System.register(['./deps2and3-0135c87a.js', './lib1-2ca2caed.js'], function (exports, module) {
  'use strict';
  var fn, fn$1;
  return {
    setters: [function (module) {
      fn = module.fn;
      fn$1 = module.fn$1;
    }, function () {}],
    execute: function () {

      function fn$2 () {
        console.log('dep1 fn');
      }

      class Main {
        constructor () {
          fn$2();
          fn();
          fn$1();
        }
      } exports('default', Main);

    }
  };
});
