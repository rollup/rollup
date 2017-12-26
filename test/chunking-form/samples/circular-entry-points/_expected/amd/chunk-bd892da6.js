define(['exports', './main1.js', './main2.js'], function (exports, __main1_js, __main2_js) { 'use strict';

  class C {
    fn (num) {
      console.log(num - __main1_js.p);
    }
  }

  class C$1 {
    fn (num) {
      console.log(num - __main2_js.p);
    }
  }

  exports.C = C;
  exports.C$1 = C$1;

});
