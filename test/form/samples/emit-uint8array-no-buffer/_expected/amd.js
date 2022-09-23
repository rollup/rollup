define(['require'], (function (require) { 'use strict';

	var asset1 = new URL(require.toUrl('./assets/asset-8e3dd2ea'), document.baseURI).href;

	var asset2 = new URL(require.toUrl('./assets/asset-75590fc1'), document.baseURI).href;

	var asset99 = new URL(require.toUrl('./assets/asset-60cc5dc9'), document.baseURI).href;

	console.log(asset1, asset2, asset99);

}));
