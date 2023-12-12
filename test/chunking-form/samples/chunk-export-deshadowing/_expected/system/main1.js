System.register(['./generated-dep1.js'], (function (exports) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.f;
    }],
    execute: (function () {

      class Main1 {
        constructor () {
          fn();
        }
      } exports("default", Main1);

    })
  };
}));
