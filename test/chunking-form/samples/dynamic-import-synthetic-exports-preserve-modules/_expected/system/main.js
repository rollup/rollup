System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			module.import('./lib.js').then(function (n) { return n.l; }).then(console.log);

		})
	};
}));
