define(['module', 'require', 'external'], function (module, require, external) { 'use strict';

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log(external);

	const _interopDefault = 0;
	const module$1 = 1;
	const require$1 = 2;
	const exports$1 = 3;
	const document$1 = 4;
	const URL$1 = 5;
	console.log(_interopDefault, module$1, require$1, exports$1, document$1, URL$1);

	new Promise(function (resolve, reject) { require(['external'], resolve, reject) });
	exports.default = 0;
	console.log(new URL(module.uri, document.baseURI).href);

	function nested1() {
		const _interopDefault = 0;
		const module$1 = 1;
		const require$1 = 2;
		const exports$1 = 3;
		const document$1 = 4;
		const URL$1 = 5;
		console.log(_interopDefault, module$1, require$1, exports$1, document$1, URL$1);

		new Promise(function (resolve, reject) { require(['external'], resolve, reject) });
		exports.default = 1;
		console.log(new URL(module.uri, document.baseURI).href);
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

});
