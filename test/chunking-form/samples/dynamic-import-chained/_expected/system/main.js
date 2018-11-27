System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('main');
			module.import('./generated-chunk2.js');

		}
	};
});
