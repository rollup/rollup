define(['exports', './main2.js'], function (exports, __main2_js) { 'use strict';

  class C {
    fn (num) {
      console.log(num - __main2_js.p);
    }
  }

  var p = 42;

  new C().fn(p);

  exports.p = p;

  Object.defineProperty(exports, '__esModule', { value: true });

});
