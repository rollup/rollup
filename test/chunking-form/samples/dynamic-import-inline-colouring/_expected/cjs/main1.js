'use strict';

require('./generated-separate.js');

var inlined$1 = 'inlined';
const x = 1;
console.log('inlined');

var inlined$2 = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	default: inlined$1,
	x: x
}, null));

const inlined = Promise.resolve().then(function () { return inlined$2; });
const separate = Promise.resolve().then(function () { return require('./generated-separate.js'); });

exports.inlined = inlined;
exports.separate = separate;
