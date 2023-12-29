System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports("default", fn);

      function fn () {
        console.log('main fn');
      }

    })
  };
}));
