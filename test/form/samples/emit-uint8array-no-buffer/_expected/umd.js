(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	var asset1 = (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-k1m4j3du').href : new URL('assets/asset-k1m4j3du', typeof document === 'undefined' ? location.href : document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

	var asset2 = (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-kjq2fr9j').href : new URL('assets/asset-kjq2fr9j', typeof document === 'undefined' ? location.href : document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

	var asset99 = (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-dv9jy2nv').href : new URL('assets/asset-dv9jy2nv', typeof document === 'undefined' ? location.href : document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href);

	console.log(asset1, asset2, asset99);

}));
