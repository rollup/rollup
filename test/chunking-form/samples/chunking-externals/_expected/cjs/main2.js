'use strict';

var dep2 = require('./generated-chunk.js');
var external = require('external');

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
    dep2.fn();
  }
}

module.exports = Main2;
