(function () {
	'use strict';

	var asset1 = 'chunkId=iife.js:moduleId=solved:fileName=assets/asset-solved-mq0xpjgt.txt:format=iife:relativePath=assets/asset-solved-mq0xpjgt.txt:referenceId=lj6zEdlc';

	var asset2 = 'resolved';

	var asset3 = new URL('assets/asset-unresolved-hkzfwzsd.txt', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href;

	console.log(asset1, asset2, asset3);

})();
