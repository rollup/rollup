'use strict';

var __chunk_js = require('./chunk.js');

function fn () {
  console.log('dep1 fn');
}

class Main1 {
  constructor () {
    fn();
    __chunk_js.fn();
  }
}

module.exports = Main1;
