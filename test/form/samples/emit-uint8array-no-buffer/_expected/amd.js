define(['require'], (function (require) { 'use strict';

	var asset1 = new URL(require.toUrl('./assets/asset-tb9uIT4z'), document.baseURI).href;

	var asset2 = new URL(require.toUrl('./assets/asset-rVqBj9gL'), document.baseURI).href;

	var asset99 = new URL(require.toUrl('./assets/asset-PPyJ5YHr'), document.baseURI).href;

	console.log(asset1, asset2, asset99);

}));
