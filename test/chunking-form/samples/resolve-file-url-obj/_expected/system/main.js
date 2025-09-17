System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			// Test string URL replacement
										const assetString = new URL('assets/test-r6af3lUh.txt', module.meta.url).href;
										// Test URL object replacement
										const assetObject = new URL('assets/test-r6af3lUh.txt', module.meta.url);

			console.log('String URL:', assetString);
			console.log('URL Object:', assetObject);

		})
	};
}));
