System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var asset1 = 'chunkId=system.js:moduleId=solved:fileName=assets/asset-solved-mq0xpjgt.txt:format=system:relativePath=assets/asset-solved-mq0xpjgt.txt:referenceId=lj6zEdlc';

			var asset2 = 'resolved';

			var asset3 = new URL('assets/asset-unresolved-hkzfwzsd.txt', module.meta.url).href;

			console.log(asset1, asset2, asset3);

		})
	};
}));
