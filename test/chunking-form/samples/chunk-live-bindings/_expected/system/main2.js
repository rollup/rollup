System.register(['./generated-dep1.js'], (function (exports) {
  'use strict';
  var fn, text;
  return {
    setters: [function (module) {
      fn = module.a;
      text = module.b;
    }],
    execute: (function () {

      class Main2 {
        constructor () {
          fn();
          console.log(text);
        }
      } exports("default", Main2);

    })
  };
}));
