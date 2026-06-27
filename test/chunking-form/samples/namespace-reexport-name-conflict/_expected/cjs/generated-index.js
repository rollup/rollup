'use strict';

var dep = require('./generated-dep.js');
var external = require('external');

console.log(external.reexported);

var lib = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.setPrototypeOf({
	reexported: dep.reexported
}, null));

exports.lib = lib;
