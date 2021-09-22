System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./lib.js').then(console.log);

		})
	};
}));
