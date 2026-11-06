'use strict';

var external = require('external');

const star = 'star';
const doubleStar = 'double star';
var dep = 42;

var dep$1 = /*#__PURE__*/Object.freeze({
	__proto__: null,
	"*": star,
	"**": doubleStar,
	default: dep
});

console.log(external["*"], star, doubleStar, true, false, dep$1);

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
exports["*default"] = dep;
Object.keys(external).forEach(function (k) {
	if (k !== 'default' && !Object.prototype.hasOwnProperty.call(exports, k)) Object.defineProperty(exports, k, {
		enumerable: true,
		get: function () { return external[k]; }
	});
});
