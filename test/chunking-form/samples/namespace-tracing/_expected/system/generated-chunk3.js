System.register(['./generated-chunk.js'], function (exports, module) {
  'use strict';
  return {
    setters: [function () {}],
    execute: function () {

      exports('a', bar);

      function bar() {
        console.log('bar');
      }

    }
  };
});
