define(['module', 'require'], (function (module, require) { 'use strict';

	var asset1 = 'chunkId=amd.js:moduleId=solved:fileName=assets/asset-solved-DSjIjiFN.txt:format=amd:relativePath=assets/asset-solved-DSjIjiFN.txt:referenceId=lj6zEdlc';

	var asset2 = 'resolved';

	var asset3 = new URL(require.toUrl('./assets/asset-unresolved-B7Qh6_pN.txt'), new URL(module.uri, document.baseURI).href).href;

	console.log(asset1, asset2, asset3);

}));
