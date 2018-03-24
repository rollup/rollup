'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var main1 = require('./main1.js');

class C {
  fn (num) {
    console.log(num - main1.p);
  }
}

var p = 43;

new C().fn(p);

exports.p = p;
