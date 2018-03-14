System.register(['./deps/dep2.js', './deps/dep3.js'], function (exports, module) {
  'use strict';
  var fn, fn$1;
  return {
    setters: [function (module) {
      fn = module.fn;
    }, function (module) {
      fn$1 = module.fn;
    }],
    execute: function () {

      class Main2 {
        constructor () {
          fn$1();
          fn();
        }
      } exports('default', Main2);

    }
  };
});
