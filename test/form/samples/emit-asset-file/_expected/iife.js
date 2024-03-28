(function () {
	'use strict';

	var logo = new URL('assets/logo-zDlmrXar.svg', document.currentScript && document.currentScript.src || document.baseURI).href;

	var logoReverse = new URL('assets/logo_reverse\'-DbGK2oiS.svg', document.currentScript && document.currentScript.src || document.baseURI).href;

	function showImage(url) {
		console.log(url);
		if (typeof document !== 'undefined') {
			const image = document.createElement('img');
			image.src = url;
			document.body.appendChild(image);
		}
	}

	showImage(logo);
	showImage(logoReverse);

})();
