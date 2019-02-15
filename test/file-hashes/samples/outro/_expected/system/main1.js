System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			console.log('main1');
			module.import('./generated-chunk.js');
			module.import('./generated-chunk2.js');

		}
	};
});
