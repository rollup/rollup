System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      exports('fn3', fn3);
      function fn3 () {
        console.log('dep2 fn3');
      }

    }
  };
});
