'use strict';

var __chunk1_js = require('./chunk1.js');

function calc (num) {
  return num * __chunk1_js.multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
