(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	var asset1 = 'chunkId=umd.js:moduleId=solved:fileName=assets/asset-solved-0oyI4hTT.txt:format=umd:relativePath=assets/asset-solved-0oyI4hTT.txt:referenceId=JY$sxHZX';

	var asset2 = 'resolved';

	var asset3 = (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-unresolved-e0Iev6TZ.txt').href : new URL('assets/asset-unresolved-e0Iev6TZ.txt', typeof document === 'undefined' ? location.href : document.currentScript && document.currentScript.src || document.baseURI).href);

	console.log(asset1, asset2, asset3);

}));
