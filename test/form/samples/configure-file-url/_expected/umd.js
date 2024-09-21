(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	var asset1 = 'chunkId=umd.js:moduleId=solved:fileName=assets/asset-solved-DSjIjiFN.txt:format=umd:relativePath=assets/asset-solved-DSjIjiFN.txt:referenceId=lj6zEdlc';

	var asset2 = 'resolved';

	var asset3 = (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-unresolved-B7Qh6_pN.txt').href : new URL('assets/asset-unresolved-B7Qh6_pN.txt', typeof document === 'undefined' ? location.href : document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

	console.log(asset1, asset2, asset3);

}));
