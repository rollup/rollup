System.register(['./generated-chunk.js'], function (exports, module) {
  'use strict';
  return {
    setters: [function () {}],
    execute: function () {

      exports('a', foo);

      function foo() {
        console.log('foo');
      }

    }
  };
});
