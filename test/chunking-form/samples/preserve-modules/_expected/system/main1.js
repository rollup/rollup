System.register(['./deps/dep1.js', './deps/dep2.js', './lib/lib2.js'], function (exports, module) {
  'use strict';
  var fn, fn$1;
  return {
    setters: [function (module) {
      fn = module.fn;
    }, function (module) {
      fn$1 = module.fn;
    }, function (module) {
      
    }],
    execute: function () {

      class Main1 {
        constructor () {
          fn();
          fn$1();
        }
      } exports('default', Main1);

    }
  };
});
