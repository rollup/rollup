System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var asset1 = 'chunkId=system.js:moduleId=solved:fileName=assets/asset-solved-DSjIjiFN.txt:format=system:relativePath=assets/asset-solved-DSjIjiFN.txt:referenceId=lj6zEdlc';

			var asset2 = 'resolved';

			var asset3 = new URL('assets/asset-unresolved-B7Qh6_pN.txt', module.meta.url).href;

			console.log(asset1, asset2, asset3);

		})
	};
}));
