System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var asset1 = 'system.js:solved:assets/asset-solved-28a7ac89.txt:assets/asset-solved-28a7ac89.txt';

			var asset2 = 'resolved';

			var asset3 = new URL('assets/asset-unresolved-8dcd7fca.txt', module.meta.url).href;

			console.log(asset1, asset2, asset3);

		})
	};
}));
