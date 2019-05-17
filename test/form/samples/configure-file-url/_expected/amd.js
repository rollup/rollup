define(['module'], function (module) { 'use strict';

	var asset1 = 'chunkId=amd.js:moduleId=solved:fileName=assets/asset-solved-9b321da2.txt:format=amd:relativePath=assets/asset-solved-9b321da2.txt:assetReferenceId=6296c678:chunkReferenceId=null';

	var asset2 = 'resolved';

	var asset3 = new URL(module.uri + '/../assets/asset-unresolved-9548436d.txt', document.baseURI).href;

	console.log(asset1, asset2, asset3);

});
