'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./generated-separate.js');

var inlined = 'inlined';
const x = 1;
console.log('inlined');

var inlined$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	'default': inlined,
	x: x
});

const inlined$2 = Promise.resolve().then(function () { return inlined$1; });
const separate = Promise.resolve().then(function () { return require('./generated-separate.js'); });

exports.inlined = inlined$2;
exports.separate = separate;
