System.register(['./generated-chunk.js'], function (exports, module) {
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
