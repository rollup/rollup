System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('resolved');

			console.log(module.meta.url);

			console.log('system.js/configure-import-meta-url/main.js');

		}
	};
});
