'use strict';

var __chunk_1 = require('./deps/dep1.js');
var __chunk_3 = require('./deps/dep2.js');

class Main1 {
  constructor () {
    __chunk_1.fn();
    __chunk_3.fn();
  }
}

module.exports = Main1;
