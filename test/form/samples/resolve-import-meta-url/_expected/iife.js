(function () {
	'use strict';

	var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
	console.log('resolved');
	console.log('resolved');
	console.log('resolved');

	console.log((_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('iife.js', document.baseURI).href));
	console.log(undefined);
	console.log(({ url: (_documentCurrentScript && _documentCurrentScript.tagName.toUpperCase() === 'SCRIPT' && _documentCurrentScript.src || new URL('iife.js', document.baseURI).href) }));

	console.log('url=iife.js:resolve-import-meta-url/main.js');
	console.log('privateProp=iife.js:resolve-import-meta-url/main.js');
	console.log('null=iife.js:resolve-import-meta-url/main.js');

})();
