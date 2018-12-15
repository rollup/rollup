'use strict';

var __chunk_1 = require('./generated-deps2and3.js');
require('./generated-lib1.js');

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
