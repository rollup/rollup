'use strict';

var __chunk_1 = require('./chunk-b663d499.js');

function fn () {
  console.log('lib1 fn');
}

function fn$1 () {
  fn();
  console.log('dep3 fn');
}

class Main2 {
  constructor () {
    fn$1();
    __chunk_1.fn();
  }
}

module.exports = Main2;
