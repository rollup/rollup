define(['require'], (function (require) { 'use strict';

	var asset1 = 'amd.js:solved:assets/asset-solved-28a7ac89.txt:assets/asset-solved-28a7ac89.txt';

	var asset2 = 'resolved';

	var asset3 = new URL(require.toUrl('./assets/asset-unresolved-8dcd7fca.txt'), document.baseURI).href;

	console.log(asset1, asset2, asset3);

}));
