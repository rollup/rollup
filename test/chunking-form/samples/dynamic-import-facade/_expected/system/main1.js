System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			module.import('./generated-dynamic.js').then(({dynamic}) => console.log('main1', dynamic));

		}
	};
});
