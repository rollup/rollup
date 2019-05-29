System.register(['./generated-chunk.js'], function (exports) {
  'use strict';
  return {
    setters: [function () {}],
    execute: function () {

      exports('f', foo);

      function foo() {
        console.log('foo');
      }

    }
  };
});
