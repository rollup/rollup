System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var value = exports('v', 42);

			const promise = exports("p", module.import('./generated-dynamic.js').then(result => console.log('main', result, value)));

		})
	};
}));
