define(['exports', './main2'], function (exports, main2) { 'use strict';

  class C {
    fn (num) {
      console.log(num - main2.p);
    }
  }

  var p = 42;

  new C().fn(p);

  exports.p = p;

  Object.defineProperty(exports, '__esModule', { value: true });

});
