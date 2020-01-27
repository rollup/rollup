System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import('./main.js');
			console.log('dynamic2');

		}
	};
});
