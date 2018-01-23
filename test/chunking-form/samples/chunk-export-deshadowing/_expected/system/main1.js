System.register(['./chunk1.js'], function (exports, module) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.fn;
    }],
    execute: function () {

      class Main1 {
        constructor () {
          fn();
        }
      } exports('default', Main1);

    }
  };
});
