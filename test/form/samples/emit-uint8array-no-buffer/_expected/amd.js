define(['require'], (function (require) { 'use strict';

	var asset1 = new URL(require.toUrl('./assets/asset-C1v24hPj'), new URL(module.uri, document.baseURI).href).href;

	var asset2 = new URL(require.toUrl('./assets/asset-CtWoGP2A'), new URL(module.uri, document.baseURI).href).href;

	var asset99 = new URL(require.toUrl('./assets/asset-8_Inlget'), new URL(module.uri, document.baseURI).href).href;

	console.log(asset1, asset2, asset99);

}));
