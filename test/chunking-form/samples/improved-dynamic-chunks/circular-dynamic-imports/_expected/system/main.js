System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import('./generated-dynamic2.js');
			module.import('./generated-dynamic1.js');
			console.log('main');

		}
	};
});
