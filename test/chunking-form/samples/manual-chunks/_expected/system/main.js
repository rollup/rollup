System.register(['./generated-deps2and3.js', './generated-lib1.js'], function (exports, module) {
  'use strict';
  var fn, fn$1;
  return {
    setters: [function (module) {
      fn = module.a;
      fn$1 = module.b;
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
