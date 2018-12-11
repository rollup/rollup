System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import('./chunk-d225f367.js').then(({dynamic}) => console.log('main1', dynamic));

		}
	};
});
