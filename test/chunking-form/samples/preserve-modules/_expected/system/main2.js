System.register(['./deps/dep2.js', './deps/dep3.js', './lib/lib2.js', './lib/lib1.js'], function (exports, module) {
  'use strict';
  var fn$1, fn;
  return {
    setters: [function (module) {
      fn$1 = module.fn;
    }, function (module) {
      fn = module.fn;
    }, function () {}, function () {}],
    execute: function () {

      class Main2 {
        constructor () {
          fn();
          fn$1();
        }
      } exports('default', Main2);

    }
  };
});
