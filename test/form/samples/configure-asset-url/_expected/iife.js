(function () {
	'use strict';

	var asset1 = 'iife.js:solved:assets/asset-solved-9b321da2.txt:assets/asset-solved-9b321da2.txt';

	var asset2 = 'resolved';

	var asset3 = new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../assets/asset-unresolved-9548436d.txt').href;

	console.log(asset1, asset2, asset3);

}());
