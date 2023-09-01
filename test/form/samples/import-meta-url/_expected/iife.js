(function () {
	'use strict';

	var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
	function log(url) {
		if (typeof document === 'undefined') {
			console.log(url);
		} else {
			document.body.innerText = url;
		}
	}

	log((_documentCurrentScript && _documentCurrentScript.src || new URL('iife.js', document.baseURI).href));

})();
