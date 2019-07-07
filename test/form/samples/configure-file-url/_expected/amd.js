define(['require'], function (require) { 'use strict';

	var asset1 = 'chunkId=amd.js:moduleId=solved:fileName=assets/asset-solved-28a7ac89.txt:format=amd:relativePath=assets/asset-solved-28a7ac89.txt:assetReferenceId=6296c678:chunkReferenceId=null';

	var asset2 = 'resolved';

	var asset3 = new URL(require.toUrl('assets/asset-unresolved-8dcd7fca.txt'), document.baseURI).href;

	console.log(asset1, asset2, asset3);

});
