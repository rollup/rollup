'use strict';

var __chunkBd892da6_js = require('./chunk-bd892da6.js');

function fn () {
  console.log('dep1 fn');
}

class Main1 {
  constructor () {
    fn();
    __chunkBd892da6_js.fn();
  }
}

module.exports = Main1;
