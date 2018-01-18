'use strict';

var external = require('external');
var __chunk_js = require('./chunk.js');

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
    __chunk_js.fn();
  }
}

module.exports = Main2;
