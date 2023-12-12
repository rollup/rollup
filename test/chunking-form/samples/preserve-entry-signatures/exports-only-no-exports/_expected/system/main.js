System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const shared = exports("s", 'shared');

			module.import('./generated-dynamic.js');

			globalThis.sharedStatic = shared;

		})
	};
}));
