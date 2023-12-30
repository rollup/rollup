System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports("fn", fn);

      function fn () {
        console.log('dep fn');
      }

    })
  };
}));
