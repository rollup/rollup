System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			var asset2 = 'resolved';

			var asset3 = new URL('assets/asset-unresolved-9548436d.txt', module.meta.url).href;

			module.import('./nested/chunk.js').then(result => console.log(result, asset2, asset3));

		}
	};
});
