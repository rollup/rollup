'use strict';

var external = require('external');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

function _interopNamespace(e) {
	if (e && e.__esModule) return e;
	var n = Object.create(null);
	if (e) {
		Object.keys(e).forEach(function (k) {
			if (k !== 'default') {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () { return e[k]; }
				});
			}
		});
	}
	n.default = e;
	return Object.freeze(n);
}

var external__default = /*#__PURE__*/_interopDefault(external);

console.log(external__default.default);

const _interopDefault$1 = 1;
const _interopNamespace$1 = 1;
const module$1 = 1;
const require$1 = 1;
const exports$1 = 1;
const document$1 = 1;
const URL$1 = 1;
console.log(_interopDefault$1, _interopNamespace$1, module$1, require$1, exports$1, document$1, URL$1);

Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('external')); }).then(console.log);
exports.default = 0;
console.log((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('cjs.js', document.baseURI).href)));

function nested1() {
	const _interopDefault = 1;
	const _interopNamespace$1 = 1;
	const module = 1;
	const require$1 = 1;
	const exports$1 = 1;
	const document$1 = 1;
	const URL$1 = 1;
	console.log(_interopDefault, _interopNamespace$1, module, require$1, exports$1, document$1, URL$1);

	Promise.resolve().then(function () { return /*#__PURE__*/_interopNamespace(require('external')); }).then(console.log);
	exports.default = 1;
	console.log((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('cjs.js', document.baseURI).href)));
}

nested1();

function nested2() {
	const _interopDefault = 1;
	const _interopNamespace = 1;
	const module = 1;
	const require = 1;
	const exports = 1;
	const document = 1;
	const URL = 1;
	console.log(_interopDefault, _interopNamespace, module, require, exports, document, URL);
}

nested2();

module.exports = exports.default;
