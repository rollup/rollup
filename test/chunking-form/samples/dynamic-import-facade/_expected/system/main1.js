System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import('./chunk-346290dd.js').then(({dynamic}) => console.log('main1', dynamic));

		}
	};
});
