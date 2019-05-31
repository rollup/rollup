'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var external = _interopDefault(require('external'));

console.log(external);

const _interopDefault$1 = 0;
const module$1 = 1;
const require$1 = 2;
const exports$1 = 3;
const document$1 = 4;
const URL$1 = 5;
console.log(_interopDefault$1, module$1, require$1, exports$1, document$1, URL$1);

Promise.resolve(require('external'));
exports.default = 0;
console.log((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('cjs.js', document.baseURI).href)));

function nested1() {
	const _interopDefault = 0;
	const module = 1;
	const require$1 = 2;
	const exports$1 = 3;
	const document$1 = 4;
	const URL$1 = 5;
	console.log(_interopDefault, module, require$1, exports$1, document$1, URL$1);

	Promise.resolve(require('external'));
	exports.default = 1;
	console.log((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('cjs.js', document.baseURI).href)));
}

nested1();

function nested2() {
	const _interopDefault = 0;
	const module = 1;
	const require = 2;
	const exports = 3;
	const document = 4;
	const URL = 5;
	console.log(_interopDefault, module, require, exports, document, URL);
}

nested2();

module.exports = exports.default;
