System.register('bundle', ['external'], function (exports, module) {
	'use strict';
	var external;
	return {
		setters: [function (module) {
			external = module.default;
		}],
		execute: function () {

			console.log(external);

			const _interopDefault = 0;
			const module$1 = 1;
			const require = 2;
			const exports$1 = 3;
			const document = 4;
			const URL = 5;
			console.log(_interopDefault, module$1, require, exports$1, document, URL);

			module.import('external');
			let value = exports('default', 0);
			console.log(module.meta.url);

			function nested1() {
				const _interopDefault = 0;
				const module$1 = 1;
				const require = 2;
				const exports$1 = 3;
				const document = 4;
				const URL = 5;
				console.log(_interopDefault, module$1, require, exports$1, document, URL);

				module.import('external');
				value = exports('default', 1);
				console.log(module.meta.url);
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

		}
	};
});
