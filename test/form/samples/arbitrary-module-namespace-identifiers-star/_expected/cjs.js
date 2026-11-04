'use strict';

var external = require('external');

const star = 'star';
const doubleStar = 'double star';

var dep = /*#__PURE__*/Object.freeze({
	__proto__: null,
	"*": star,
	"**": doubleStar
});

console.log(external["*"], star, doubleStar, true, false, dep);

const legal = 10;

Object.defineProperty(exports, "**", {
	enumerable: true,
	get: function () { return external["*"]; }
});
Object.defineProperty(exports, "reexportedStar", {
	enumerable: true,
	get: function () { return external["*"]; }
});
exports["*"] = legal;
