define(['require'], (function (require) { 'use strict';

	var logo = new URL(require.toUrl('./assets/logo-zDlmrXar.svg'), new URL(module.uri, document.baseURI).href).href;

	var logoReverse = new URL(require.toUrl('./assets/logo_reverse\'-DbGK2oiS.svg'), new URL(module.uri, document.baseURI).href).href;

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

}));
