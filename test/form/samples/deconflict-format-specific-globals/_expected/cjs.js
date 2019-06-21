'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

function _interopNamespace(e) {
	if (e && e.__esModule) { return e; } else {
		var n = {};
		if (e) {
			Object.keys(e).forEach(function (k) {
				var d = Object.getOwnPropertyDescriptor(e, k);
				Object.defineProperty(n, k, d.get ? d : {
					enumerable: true,
					get: function () {
						return e[k];
					}
				});
			});
		}
		n['default'] = e;
		return n;
	}
}

var external = _interopDefault(require('external'));

console.log(external);

const _interopDefault$1 = 1;
const _interopNamespace$1 = 1;
const module$1 = 1;
const require$1 = 1;
const exports$1 = 1;
const document$1 = 1;
const URL$1 = 1;
console.log(_interopDefault$1, _interopNamespace$1, module$1, require$1, exports$1, document$1, URL$1);

Promise.resolve(_interopNamespace(require('external')));
exports.default = 0;
console.log((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('cjs.js', document.baseURI).href)));

function nested1() {
	const _interopDefault = 1;
	const _interopNamespace$1 = 1;
	const module = 1;
	const require$1 = 1;
	const exports$1 = 1;
	const document$1 = 1;
	const URL$1 = 1;
	console.log(_interopDefault, _interopNamespace$1, module, require$1, exports$1, document$1, URL$1);

	Promise.resolve(_interopNamespace(require('external')));
	exports.default = 1;
	console.log((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('cjs.js', document.baseURI).href)));
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
