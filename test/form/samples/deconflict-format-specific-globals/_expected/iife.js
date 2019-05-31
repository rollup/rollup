var bundle = (function (external) {
	'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log(external);

	const _interopDefault = 0;
	const module = 1;
	const require = 2;
	const exports$1 = 3;
	const document$1 = 4;
	const URL$1 = 5;
	console.log(_interopDefault, module, require, exports$1, document$1, URL$1);

	import('external');
	exports.default = 0;
	console.log((document.currentScript && document.currentScript.src || new URL('iife.js', document.baseURI).href));

	function nested1() {
		const _interopDefault = 0;
		const module = 1;
		const require = 2;
		const exports$1 = 3;
		const document$1 = 4;
		const URL$1 = 5;
		console.log(_interopDefault, module, require, exports$1, document$1, URL$1);

		import('external');
		exports.default = 1;
		console.log((document.currentScript && document.currentScript.src || new URL('iife.js', document.baseURI).href));
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

	return exports.default;

}(external));
