(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(exports, require('external')) :
	typeof define === 'function' && define.amd ? define(['exports', 'external'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.bundle = factory(global.bundle = {}, global.external));
})(this, (function (exports, external) { 'use strict';

	var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
	function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

	var external__default = /*#__PURE__*/_interopDefault(external);

	console.log(external__default.default);

	const _interopDefault$1 = 1;
	const _interopNamespace$1 = 1;
	const module = 1;
	const require$1 = 1;
	const exports$1 = 1;
	const document$1 = 1;
	const URL$1 = 1;
	console.log(_interopDefault$1, _interopNamespace$1, module, require$1, exports$1, document$1, URL$1);

	import('external').then(console.log);
	exports.default = 0;
	console.log((typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('umd.js', document.baseURI).href)));

	function nested1() {
		const _interopDefault = 1;
		const _interopNamespace = 1;
		const module = 1;
		const require$1 = 1;
		const exports$1 = 1;
		const document$1 = 1;
		const URL$1 = 1;
		console.log(_interopDefault, _interopNamespace, module, require$1, exports$1, document$1, URL$1);

		import('external').then(console.log);
		exports.default = 1;
		console.log((typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : typeof document === 'undefined' ? location.href : (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('umd.js', document.baseURI).href)));
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

	return exports.default;

}));
