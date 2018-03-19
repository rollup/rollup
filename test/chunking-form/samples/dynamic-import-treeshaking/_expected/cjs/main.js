'use strict';

var __chunk_1 = require('./chunk-909b409c.js');

function calc (num) {
  return num * __chunk_1.multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
