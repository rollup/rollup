'use strict';

var __chunk36864708_js = require('./chunk-36864708.js');

function calc (num) {
  return num * __chunk36864708_js.multiplier;
}

function fn (num) {
  return num * calc(num);
}

console.log(fn(5));
