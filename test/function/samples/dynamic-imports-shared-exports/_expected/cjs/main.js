'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const shared = true;

Promise.resolve().then(function () { return require('./generated-dynamic1.js'); }).then(function (n) { return n.dynamic1; });
console.log(shared);

exports.shared = shared;
