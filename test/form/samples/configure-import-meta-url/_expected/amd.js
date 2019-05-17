define(['module'], function (module) { 'use strict';

	console.log('resolved');
	console.log('resolved');
	console.log('resolved');

	console.log(new URL(module.uri, document.baseURI).href);
	console.log(undefined);
	console.log(({ url: new URL(module.uri, document.baseURI).href }));

	console.log('url=amd.js:configure-import-meta-url/main.js');
	console.log('privateProp=amd.js:configure-import-meta-url/main.js');
	console.log('null=amd.js:configure-import-meta-url/main.js');

});
