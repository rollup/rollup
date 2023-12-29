System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports("b", bar);

      function bar() {
        console.log('bar');
      }

    })
  };
}));
