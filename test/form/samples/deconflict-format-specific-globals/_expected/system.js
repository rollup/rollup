System.register('bundle', ['external'], (function (exports, module) {
	'use strict';
	var external;
	return {
		setters: [function (module) {
			external = module.default;
		}],
		execute: (function () {

			console.log(external);

			const _interopDefault = 1;
			const _interopNamespace = 1;
			const module$1 = 1;
			const require = 1;
			const exports$1 = 1;
			const document = 1;
			const URL = 1;
			console.log(_interopDefault, _interopNamespace, module$1, require, exports$1, document, URL);

			module.import('external').then(console.log);
			let value = exports("default", 0);
			console.log(module.meta.url);

			function nested1() {
				const _interopDefault = 1;
				const _interopNamespace = 1;
				const module$1 = 1;
				const require = 1;
				const exports$1 = 1;
				const document = 1;
				const URL = 1;
				console.log(_interopDefault, _interopNamespace, module$1, require, exports$1, document, URL);

				module.import('external').then(console.log);
				exports("default", value = 1);
				console.log(module.meta.url);
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

		})
	};
}));
