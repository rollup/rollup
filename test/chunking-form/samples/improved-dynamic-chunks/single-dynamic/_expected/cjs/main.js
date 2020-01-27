'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const value = 'shared';

console.log('main', value);
new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); });

exports.value = value;
