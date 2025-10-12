define(['module', 'require'], (function (module, require) { 'use strict';

	// Test string URL replacement
								const assetString = new URL(require.toUrl('./assets/test-r6af3lUh.txt'), new URL(module.uri, document.baseURI).href).href;
								// Test URL object replacement
								const assetObject = new URL(require.toUrl('./assets/test-r6af3lUh.txt'), new URL(module.uri, document.baseURI).href);

	console.log('String URL:', assetString);
	console.log('URL Object:', assetObject);

}));
