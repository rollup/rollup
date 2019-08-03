'use strict';

var dep2 = require('./generated-dep2.js');

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
    dep2.fn();
  }
}

module.exports = Main2;
