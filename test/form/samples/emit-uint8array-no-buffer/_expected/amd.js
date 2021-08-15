define(['require'], (function (require) { 'use strict';

	var asset1a = new URL(require.toUrl('./assets/asset-dc5cb674'), document.baseURI).href;

	var asset1b = new URL(require.toUrl('./assets/asset-dc5cb674'), document.baseURI).href;

	var asset2a = new URL(require.toUrl('./assets/asset-52cbd095'), document.baseURI).href;

	var asset2b = new URL(require.toUrl('./assets/asset-52cbd095'), document.baseURI).href;

	var asset99a = new URL(require.toUrl('./assets/asset-c568a840'), document.baseURI).href;

	console.log(asset1a, asset1b, asset2a, asset2b, asset99a);

}));
