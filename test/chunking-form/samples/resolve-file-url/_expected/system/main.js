System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			const asset$1 = 'resolved';
			const chunk$1 = 'resolved';

			const asset = new URL('assets/asset-unresolved-e0Iev6TZ.txt', module.meta.url).href;
			const chunk = new URL('nested/chunk2.js', module.meta.url).href;

			module.import('./nested/chunk.js').then(result => console.log(result, chunk$1, chunk, asset$1, asset));

		})
	};
}));
