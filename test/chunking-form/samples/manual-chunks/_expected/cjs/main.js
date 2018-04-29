'use strict';

var __chunk_2 = require('./deps2and3-9aeb2d5b.js');
require('./lib1-569e10cd.js');

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
