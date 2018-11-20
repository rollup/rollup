'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

require('./chunk-bc97caee.js');

var inlined = 'inlined';
const x = 1;

var inlined$1 = /*#__PURE__*/Object.freeze({
	default: inlined,
	x: x
});

const inlined$2 = Promise.resolve().then(function () { return inlined$1; });
const separate = Promise.resolve(require("./chunk-bc97caee.js"));

exports.inlined = inlined$2;
exports.separate = separate;
