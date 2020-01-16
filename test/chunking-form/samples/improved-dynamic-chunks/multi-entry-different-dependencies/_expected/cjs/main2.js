'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var dep2 = require('./generated-dep2.js');

// doesn't import value1, so we can't have also loaded value1?
console.log('main2', dep2.value2);
new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); });

exports.value2 = dep2.value2;
