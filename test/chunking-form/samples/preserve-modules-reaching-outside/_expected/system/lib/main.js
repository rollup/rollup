System.register(['../dep.js'], function (exports, module) {
  'use strict';
  var fn;
  return {
    setters: [function (module) {
      fn = module.fn;
    }],
    execute: function () {

      class Main {
        constructor () {
          fn();
        }
      } exports('default', Main);

    }
  };
});
