System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import('./main.js').then(result => console.log('importer', result));

		}
	};
});
