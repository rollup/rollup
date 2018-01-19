System.register(['./chunk1.js'], function (exports, module) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.fn;
    }],
    execute: function () {

      function fn$1 () {
        console.log('dep1 fn');
      }

      class Main1 {
        constructor () {
          fn$1();
          fn();
        }
      } exports('default', Main1);

    }
  };
});
