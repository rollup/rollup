System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const value1 = exports("v", 'dep');

			module.import('./generated-dynamic.js');
			console.log('shared', value1);

		})
	};
}));
