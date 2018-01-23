'use strict';

var __chunk1_js = require('./chunk1.js');

function calc (num) {
  return num * __chunk1_js.multiplier;
}

function fn (num) {
  return num * calc(num);
}

function dynamic (num) {
  return Promise.resolve({ default: require("./dep2.js") })
  .then(dep2 => {
    return dep2.mult(num);
  });
}

console.log(fn(5));

dynamic(10).then(num => {
  console.log(num);
});
