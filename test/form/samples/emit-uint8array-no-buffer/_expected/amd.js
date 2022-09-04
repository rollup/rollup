define(['require'], (function (require) { 'use strict';

	var asset1a = new URL(require.toUrl('./assets/asset-8e3dd2ea'), document.baseURI).href;

	var asset1b = new URL(require.toUrl('./assets/asset-8e3dd2ea'), document.baseURI).href;

	var asset2a = new URL(require.toUrl('./assets/asset-75590fc1'), document.baseURI).href;

	var asset2b = new URL(require.toUrl('./assets/asset-75590fc1'), document.baseURI).href;

	var asset99a = new URL(require.toUrl('./assets/asset-60cc5dc9'), document.baseURI).href;

	console.log(asset1a, asset1b, asset2a, asset2b, asset99a);

}));
