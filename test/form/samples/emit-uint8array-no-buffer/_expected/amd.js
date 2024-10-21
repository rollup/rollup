define(['require'], (function (require) { 'use strict';

	var asset1 = new URL(require.toUrl('./assets/asset-k1m4j3du'), document.baseURI).href;

	var asset2 = new URL(require.toUrl('./assets/asset-kjq2fr9j'), document.baseURI).href;

	var asset99 = new URL(require.toUrl('./assets/asset-dv9jy2nv'), document.baseURI).href;

	console.log(asset1, asset2, asset99);

}));
