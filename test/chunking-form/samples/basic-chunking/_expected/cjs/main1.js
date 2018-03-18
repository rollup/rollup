'use strict';

var __chunk_1 = require('./chunk-b663d499.js');

function fn () {
  console.log('dep1 fn');
}

class Main1 {
  constructor () {
    fn();
    __chunk_1.fn();
  }
}

module.exports = Main1;
