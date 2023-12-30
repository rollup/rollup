System.register('foo', [], (function (exports) {
  'use strict';
  return {
    execute: (function () {

      exports("default", foo);

      function foo () {
        console.log( 'indented with spaces' );
      }

    })
  };
}));
