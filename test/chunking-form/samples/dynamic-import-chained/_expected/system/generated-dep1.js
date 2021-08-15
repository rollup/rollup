System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			console.log('dep1');
			module.import('./generated-dep2.js');

		})
	};
}));
