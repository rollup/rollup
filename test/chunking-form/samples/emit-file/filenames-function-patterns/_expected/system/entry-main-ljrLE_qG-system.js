System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			console.log('main');
			module.import('./chunk-deb-BJKR2fPr-system.js').then(console.log);

		})
	};
}));
