System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const value = exports("value", 'shared');

			console.log('dynamic1', value);
			module.import('./generated-dynamic1.js');

		})
	};
}));
