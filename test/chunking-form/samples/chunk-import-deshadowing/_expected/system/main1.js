System.register(['./generated-chunk.js'], function () {
  'use strict';
  var emptyFunction;
  return {
    setters: [function (module) {
      emptyFunction = module.e;
    }],
    execute: function () {

      function fn () {
        var emptyFunction$1 = emptyFunction;
        console.log(emptyFunction$1);
      }

      fn();

    }
  };
});
