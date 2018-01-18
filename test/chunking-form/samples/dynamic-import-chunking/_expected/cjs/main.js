'use strict';

var __chunk_js = require('./chunk.js');

function calc (num) {
  return num * __chunk_js.multiplier;
}

function fn (num) {
  return num * calc(num);
}

function dynamic (num) {
  return Promise.resolve(require("./dep2.js"))
  .then(dep2 => {
    return dep2.mult(num);
  });
}

console.log(fn(5));

dynamic(10).then(num => {
  console.log(num);
});
