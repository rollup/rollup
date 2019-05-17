(function () {
	'use strict';

	function log(url) {
		if (typeof document === 'undefined') {
			console.log(url);
		} else {
			document.body.innerText = url;
		}
	}

	log((document.currentScript && document.currentScript.src || new URL('iife.js', document.baseURI).href));

}());
