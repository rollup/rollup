'use strict';

var __chunk_js = require('./chunk.js');

function calc (num) {
  return num * __chunk_js.multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
