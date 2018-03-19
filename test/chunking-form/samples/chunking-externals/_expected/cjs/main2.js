'use strict';

var external = require('external');
var __chunk_9 = require('./chunk-b663d499.js');

function fn () {
  console.log('lib1 fn');
  external.fn();
}

function fn$1 () {
  fn();
  console.log('dep3 fn');
}

class Main2 {
  constructor () {
    fn$1();
    __chunk_9.fn();
  }
}

module.exports = Main2;
