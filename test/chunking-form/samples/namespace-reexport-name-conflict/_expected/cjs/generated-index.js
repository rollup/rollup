'use strict';

var dep = require('./generated-dep.js');
var external = require('external');

console.log(external.reexported);

var lib = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	reexported: dep.reexported
}, '__esModule', { value: true }));

exports.lib = lib;
