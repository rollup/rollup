'use strict';

var dep4 = require('./generated-dep4.js');

function calc (num) {
  return num * dep4.multiplier;
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
