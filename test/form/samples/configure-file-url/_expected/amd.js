define(['require'], (function (require) { 'use strict';

	var asset1 = 'chunkId=amd.js:moduleId=solved:fileName=assets/asset-solved-mq0xpjgt.txt:format=amd:relativePath=assets/asset-solved-mq0xpjgt.txt:referenceId=lj6zEdlc';

	var asset2 = 'resolved';

	var asset3 = new URL(require.toUrl('./assets/asset-unresolved-hkzfwzsd.txt'), document.baseURI).href;

	console.log(asset1, asset2, asset3);

}));
