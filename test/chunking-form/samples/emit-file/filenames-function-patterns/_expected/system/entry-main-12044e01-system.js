System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			console.log('main');
			module.import('./chunk-deb-467d682b-system.js').then(console.log);

		})
	};
}));
