'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var __main1_js = require('./main1.js');

class C {
  fn (num) {
    console.log(num - __main1_js.p);
  }
}

var p = 43;

new C().fn(p);

exports.p = p;
