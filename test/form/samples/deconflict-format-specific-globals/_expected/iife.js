var bundle = (function (external) {
	'use strict';

	function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex : { 'default': ex }; }

	var external__default = /*#__PURE__*/_interopDefault(external);

	console.log(external__default['default']);

	const _interopDefault$1 = 1;
	const _interopNamespace = 1;
	const module = 1;
	const require = 1;
	const exports$1 = 1;
	const document$1 = 1;
	const URL$1 = 1;
	console.log(_interopDefault$1, _interopNamespace, module, require, exports$1, document$1, URL$1);

	import('external').then(console.log);
	exports.default = 0;
	console.log((document.currentScript && document.currentScript.src || new URL('iife.js', document.baseURI).href));

	function nested1() {
		const _interopDefault = 1;
		const _interopNamespace = 1;
		const module = 1;
		const require = 1;
		const exports$1 = 1;
		const document$1 = 1;
		const URL$1 = 1;
		console.log(_interopDefault, _interopNamespace, module, require, exports$1, document$1, URL$1);

		import('external').then(console.log);
		exports.default = 1;
		console.log((document.currentScript && document.currentScript.src || new URL('iife.js', document.baseURI).href));
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

}(external));
