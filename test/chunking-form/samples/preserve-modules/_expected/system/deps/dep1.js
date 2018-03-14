System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('fn', fn);
      function fn () {
        console.log('dep1 fn');
      }

    }
  };
});
