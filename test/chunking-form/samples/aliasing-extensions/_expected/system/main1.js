System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('main1');
			module.import('./generated-main4.dynamic.js');
			module.import('./generated-main5.js');

		}
	};
});
