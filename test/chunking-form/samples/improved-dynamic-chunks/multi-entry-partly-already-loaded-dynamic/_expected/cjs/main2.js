'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var dep2 = require('./generated-dep2.js');

console.log('main2', dep2.value2);
new Promise(function (resolve) { resolve(require('./generated-dynamic2.js')); });

exports.value2 = dep2.value2;
