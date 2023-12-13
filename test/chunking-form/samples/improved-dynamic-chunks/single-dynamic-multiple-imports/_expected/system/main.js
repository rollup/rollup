System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const value = exports("value", 'shared');

			console.log('a', value);
			module.import('./generated-dynamic.js');

			console.log('main', value);
			module.import('./generated-dynamic.js');

		})
	};
}));
