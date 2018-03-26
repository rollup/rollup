'use strict';

var __chunk_1 = require('./chunk-3a53aa58.js');

function calc (num) {
  return num * __chunk_1.multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
