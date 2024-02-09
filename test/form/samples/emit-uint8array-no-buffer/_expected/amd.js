define(['require'], (function (require) { 'use strict';

	var asset1 = new URL(require.toUrl('./assets/asset-C1v24hPj'), document.baseURI).href;

	var asset2 = new URL(require.toUrl('./assets/asset-CtWoGP2A'), document.baseURI).href;

	var asset99 = new URL(require.toUrl('./assets/asset-8_Inlget'), document.baseURI).href;

	console.log(asset1, asset2, asset99);

}));
