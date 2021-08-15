System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			console.log('main');
			module.import('./chunk-deb-3a28869f-system.js').then(console.log);

		})
	};
}));
