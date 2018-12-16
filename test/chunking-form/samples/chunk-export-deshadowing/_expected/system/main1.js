System.register(['./generated-chunk.js'], function (exports, module) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.a;
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
