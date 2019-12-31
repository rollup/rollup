'use strict';

var multiplier = 7;

function calc (num) {
  return num * multiplier;
}

function fn (num) {
  return num * calc(num);
}

function dynamic (num) {
  return new Promise(function (resolve) { resolve(require('./generated-dep2.js')); })
  .then(dep2 => {
    return dep2.mult(num);
  });
}

console.log(fn(5));

dynamic(10).then(num => {
  console.log(num);
});

exports.multiplier = multiplier;
