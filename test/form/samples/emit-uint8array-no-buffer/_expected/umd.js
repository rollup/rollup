(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
})((function () { 'use strict';

	var asset1 = (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-8e3dd2ea').href : new URL('assets/asset-8e3dd2ea', typeof document === 'undefined' ? location.href : document.currentScript && document.currentScript.src || document.baseURI).href);

	var asset2 = (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-75590fc1').href : new URL('assets/asset-75590fc1', typeof document === 'undefined' ? location.href : document.currentScript && document.currentScript.src || document.baseURI).href);

	var asset99 = (typeof document === 'undefined' && typeof location === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/asset-60cc5dc9').href : new URL('assets/asset-60cc5dc9', typeof document === 'undefined' ? location.href : document.currentScript && document.currentScript.src || document.baseURI).href);

	console.log(asset1, asset2, asset99);

}));
