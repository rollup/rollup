define(['exports', './main1'], function (exports, main1) { 'use strict';

  class C {
    fn (num) {
      console.log(num - main1.p);
    }
  }

  var p = 43;

  new C().fn(p);

  exports.p = p;

  Object.defineProperty(exports, '__esModule', { value: true });

});
