System.register([], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports("f", foo);

      function foo() {
        console.log('foo');
      }

    })
  };
}));
