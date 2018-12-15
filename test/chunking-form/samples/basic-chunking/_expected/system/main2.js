System.register(['./generated-chunk.js'], function (exports, module) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.a;
    }],
    execute: function () {

      function fn$1 () {
        console.log('lib1 fn');
      }

      function fn$2 () {
        fn$1();
        console.log('dep3 fn');
      }

      class Main2 {
        constructor () {
          fn$2();
          fn();
        }
      } exports('default', Main2);

    }
  };
});
