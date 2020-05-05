'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var value = 42;

const promise = new Promise(function (resolve) { resolve(require('./generated-dynamic.js')); }).then(result => console.log('main', result, value));

var main = /*#__PURE__*/Object.freeze({
	__proto__: null,
	promise: promise
});

exports.main = main;
exports.promise = promise;
exports.value = value;
