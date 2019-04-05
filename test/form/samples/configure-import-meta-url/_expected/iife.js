(function () {
	'use strict';

	console.log('resolved');

	console.log((document.currentScript && document.currentScript.src || new URL('iife.js', document.baseURI).href));

	console.log('iife.js/configure-import-meta-url/main.js');

}());
