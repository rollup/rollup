System.register(['./generated-chunk.js'], function (exports) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.a;
    }],
    execute: function () {

      class Main2 {
        constructor () {
          fn();
        }
      } exports('default', Main2);

    }
  };
});
