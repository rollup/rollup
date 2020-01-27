'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const value = 'shared';

console.log('dynamic1', value);
new Promise(function (resolve) { resolve(require('./generated-dynamic1.js')); });

exports.value = value;
