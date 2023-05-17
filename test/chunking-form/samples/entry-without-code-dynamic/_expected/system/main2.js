System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./generated-dynamic.js').then(console.log);

		})
	};
}));
