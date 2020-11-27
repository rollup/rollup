System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('main');
			module.import('./entry-deb-system.js').then(console.log);

		}
	};
});
