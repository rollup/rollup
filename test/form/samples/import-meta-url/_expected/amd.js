define(['module'], (function (module) { 'use strict';

	function log(url) {
		if (typeof document === 'undefined') {
			console.log(url);
		} else {
			document.body.innerText = url;
		}
	}

	log(new URL(module.uri, document.baseURI).href);

}));
