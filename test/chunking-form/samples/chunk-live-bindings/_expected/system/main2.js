System.register(['./chunk-c4e4bfeb.js'], function (exports, module) {
  'use strict';
  var fn, text;
  return {
    setters: [function (module) {
      fn = module.fn$1;
      text = module.text$1;
    }],
    execute: function () {

      class Main2 {
        constructor () {
          fn();
          console.log(text);
        }
      } exports('default', Main2);

    }
  };
});
