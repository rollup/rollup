System.register(['./generated-deps2and3.js', './generated-lib1.js'], function (exports, module) {
  'use strict';
  var fn$1, fn$2;
  return {
    setters: [function (module) {
      fn$1 = module.a;
      fn$2 = module.b;
    }, function () {}],
    execute: function () {

      function fn () {
        console.log('dep1 fn');
      }

      class Main {
        constructor () {
          fn();
          fn$1();
          fn$2();
        }
      } exports('default', Main);

    }
  };
});
