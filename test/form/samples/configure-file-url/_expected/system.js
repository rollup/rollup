System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var asset1 = 'chunkId=system.js:moduleId=solved:fileName=assets/asset-solved-0oyI4hTT.txt:format=system:relativePath=assets/asset-solved-0oyI4hTT.txt:referenceId=JY$sxHZX';

			var asset2 = 'resolved';

			var asset3 = new URL('assets/asset-unresolved-e0Iev6TZ.txt', module.meta.url).href;

			console.log(asset1, asset2, asset3);

		})
	};
}));
