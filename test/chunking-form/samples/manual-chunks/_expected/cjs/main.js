'use strict';

var __chunk_2 = require('./deps2and3-4b17c5d9.js');
require('./lib1-1c91263b.js');

function fn () {
  console.log('dep1 fn');
}

class Main {
  constructor () {
    fn();
    __chunk_2.fn();
    __chunk_2.fn$1();
  }
}

module.exports = Main;
