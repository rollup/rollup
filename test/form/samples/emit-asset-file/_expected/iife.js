(function () {
	'use strict';

	var logo = new URL('assets/logo-a2a2cdc4.svg', document.currentScript && document.currentScript.src || document.baseURI).href;

	function showImage(url) {
		console.log(url);
		if (typeof document !== 'undefined') {
			const image = document.createElement('img');
			image.src = url;
			document.body.appendChild(image);
		}
	}

	showImage(logo);

})();
