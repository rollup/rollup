System.register(['./chunk-3526f55f.js'], function (exports, module) {
  'use strict';
  var fn, text;
  return {
    setters: [function (module) {
      fn = module.fn;
      text = module.text;
    }],
    execute: function () {

      class Main1 {
        constructor () {
          fn();
          console.log(text);
        }
      } exports('default', Main1);

    }
  };
});
