'use strict';

var __chunk_1 = require('./deps2and3-c8fe246d.js');
require('./lib1-569e10cd.js');

function fn () {
  console.log('dep1 fn');
}

class Main {
  constructor () {
    fn();
    __chunk_1.fn();
    __chunk_1.fn$1();
  }
}

module.exports = Main;
