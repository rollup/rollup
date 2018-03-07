System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      var foo = function() {
        foo.toString = null;
      }.toString();

      console.log(foo);

    }
  };
});
