(function () {
	'use strict';

	var asset1 = 'chunkId=iife.js:moduleId=solved:fileName=assets/asset-solved-9b321da2.txt:format=iife:relativePath=assets/asset-solved-9b321da2.txt:assetReferenceId=6296c678:chunkReferenceId=null';

	var asset2 = 'resolved';

	var asset3 = new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../assets/asset-unresolved-9548436d.txt').href;

	console.log(asset1, asset2, asset3);

}());
