System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var asset1 = 'chunkId=system.js:moduleId=solved:fileName=assets/asset-solved-230ecafdb.txt:format=system:relativePath=assets/asset-solved-230ecafdb.txt:referenceId=6296c678';

			var asset2 = 'resolved';

			var asset3 = new URL('assets/asset-unresolved-f4c1e86cd.txt', module.meta.url).href;

			console.log(asset1, asset2, asset3);

		})
	};
}));
