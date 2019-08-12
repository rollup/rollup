define(['module', 'require', 'external'], function (module, require, external) { 'use strict';

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

	external = external && external.hasOwnProperty('default') ? external['default'] : external;

	console.log(external);

	const _interopDefault = 1;
	const _interopNamespace$1 = 1;
	const module$1 = 1;
	const require$1 = 1;
	const exports$1 = 1;
	const document$1 = 1;
	const URL$1 = 1;
	console.log(_interopDefault, _interopNamespace$1, module$1, require$1, exports$1, document$1, URL$1);

	new Promise(function (resolve, reject) { require(['external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
	exports.default = 0;
	console.log(new URL(module.uri, document.baseURI).href);

	function nested1() {
		const _interopDefault = 1;
		const _interopNamespace$1 = 1;
		const module$1 = 1;
		const require$1 = 1;
		const exports$1 = 1;
		const document$1 = 1;
		const URL$1 = 1;
		console.log(_interopDefault, _interopNamespace$1, module$1, require$1, exports$1, document$1, URL$1);

		new Promise(function (resolve, reject) { require(['external'], function (m) { resolve(_interopNamespace(m)); }, reject) });
		exports.default = 1;
		console.log(new URL(module.uri, document.baseURI).href);
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

});
