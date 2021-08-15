System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const asset$1 = 'resolved';
			const chunk$1 = 'resolved';

			const asset = new URL('assets/asset-unresolved-8dcd7fca.txt', module.meta.url).href;
			const chunk = new URL('nested/chunk.js', module.meta.url).href;

			module.import('./nested/chunk2.js').then(result => console.log(result, chunk$1, chunk, asset$1, asset));

		})
	};
}));
