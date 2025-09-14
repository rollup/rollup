define(['require'], (function (require) { 'use strict';

	// Test string URL replacement
								const assetString = new URL(require.toUrl('./assets/test-r6af3lUh.txt'), document.baseURI).href;
								// Test URL object replacement
								const assetObject = new URL(require.toUrl('./assets/test-r6af3lUh.txt'), document.baseURI);

	console.log('String URL:', assetString);
	console.log('URL Object:', assetObject);

}));
