System.register(['../lib/lib1.js'], function (exports, module) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.fn;
    }],
    execute: function () {

      exports('fn', fn$1);

      function fn$1 () {
        fn();
        console.log('dep3 fn');
      }

    }
  };
});
