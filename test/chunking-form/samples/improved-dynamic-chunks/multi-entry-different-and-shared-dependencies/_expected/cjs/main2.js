'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var fromMain1And2 = require('./generated-from-main-1-and-2.js');

console.log('main2', fromMain1And2.value2, fromMain1And2.value3);
Promise.resolve().then(function () { return require('./generated-dynamic.js'); });

exports.value2 = fromMain1And2.value2;
exports.value3 = fromMain1And2.value3;
