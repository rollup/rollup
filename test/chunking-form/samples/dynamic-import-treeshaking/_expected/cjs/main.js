'use strict';

var __chunk_15 = require('./chunk-909b409c.js');

function calc (num) {
  return num * __chunk_15.multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
