'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const value = 'shared';

console.log('main', value);
Promise.resolve().then(function () { return require('./generated-dynamic.js'); });

exports.value = value;
