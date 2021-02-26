'use strict';

var dep2 = require('./generated-dep2.js');
var external = require('external');

function fn$1 () {
  console.log('lib1 fn');
  external.fn();
}

function fn () {
  fn$1();
  console.log('dep3 fn');
}

class Main2 {
  constructor () {
    fn();
    dep2.fn();
  }
}

module.exports = Main2;
