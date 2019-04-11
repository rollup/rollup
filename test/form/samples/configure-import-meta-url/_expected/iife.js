(function () {
	'use strict';

	console.log('resolved');
	console.log('resolved');
	console.log('resolved');

	console.log((document.currentScript && document.currentScript.src || new URL('iife.js', document.baseURI).href));
	console.log(undefined);
	console.log(({ url: (document.currentScript && document.currentScript.src || new URL('iife.js', document.baseURI).href) }));

	console.log('url=iife.js:configure-import-meta-url/main.js');
	console.log('privateProp=iife.js:configure-import-meta-url/main.js');
	console.log('null=iife.js:configure-import-meta-url/main.js');

}());
