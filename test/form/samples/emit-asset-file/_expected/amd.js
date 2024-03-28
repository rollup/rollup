define(['require'], (function (require) { 'use strict';

	var logo = new URL(require.toUrl('./assets/logo-zDlmrXar.svg'), document.baseURI).href;

	var logoReverse = new URL(require.toUrl('./assets/logo_reverse\'-DbGK2oiS.svg'), document.baseURI).href;

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
