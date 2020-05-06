'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var dep2 = require('./generated-dep2.js');

const value1 = 'shared1';

console.log('main1', value1, dep2.value2);
Promise.resolve().then(function () { return require('./generated-dynamic1.js'); });

exports.value2 = dep2.value2;
exports.value1 = value1;
