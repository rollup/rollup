System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const shared = exports("s", 'shared');

			console.log(shared);
			module.import('./generated-dynamic.js');
			const unused = exports("u", 42);

		})
	};
}));
