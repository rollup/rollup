System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			const asset = 'resolved';
			const chunk = 'resolved';

			const asset$1 = new URL('assets/asset-unresolved-8dcd7fca.txt', module.meta.url).href;
			const chunk$1 = new URL('nested/chunk.js', module.meta.url).href;

			module.import('./nested/chunk2.js').then(result => console.log(result, chunk, chunk$1, asset, asset$1));

		}
	};
});
