'use strict';

var __main1_js = require('./main1.js');
var __main2_js = require('./main2.js');

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
