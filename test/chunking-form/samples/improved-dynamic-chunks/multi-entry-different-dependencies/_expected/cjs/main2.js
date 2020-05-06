'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var dep2 = require('./generated-dep2.js');

console.log('main2', dep2.value2);
Promise.resolve().then(function () { return require('./generated-dynamic.js'); });

exports.value2 = dep2.value2;
