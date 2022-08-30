'use strict';

var value = 42;

const promise = Promise.resolve().then(function () { return require('./generated-dynamic.js'); }).then(result => console.log('main', result, value));

var main = /*#__PURE__*/Object.freeze({
	__proto__: null,
	promise: promise
});

exports.main = main;
exports.promise = promise;
exports.value = value;
