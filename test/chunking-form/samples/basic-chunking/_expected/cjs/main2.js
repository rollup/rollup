'use strict';

var __chunkBd892da6_js = require('./chunk-bd892da6.js');

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
    __chunkBd892da6_js.fn();
  }
}

module.exports = Main2;
