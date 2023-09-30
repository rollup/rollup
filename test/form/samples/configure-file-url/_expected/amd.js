define(['require'], (function (require) { 'use strict';

	var asset1 = 'chunkId=amd.js:moduleId=solved:fileName=assets/asset-solved-0oyI4hTT.txt:format=amd:relativePath=assets/asset-solved-0oyI4hTT.txt:referenceId=JY$sxHZX';

	var asset2 = 'resolved';

	var asset3 = new URL(require.toUrl('./assets/asset-unresolved-e0Iev6TZ.txt'), document.baseURI).href;

	console.log(asset1, asset2, asset3);

}));
