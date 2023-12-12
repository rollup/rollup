System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const dep2 = exports("d", 'dep2');

			console.log(dep2);
			module.import('./generated-dynamic.js');

		})
	};
}));
