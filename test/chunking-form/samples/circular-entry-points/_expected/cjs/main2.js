'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var main1_js = require('./main1.js');

class C {
  fn (num) {
    console.log(num - main1_js.p);
  }
}

var p = 43;

new C().fn(p);

exports.p = p;
