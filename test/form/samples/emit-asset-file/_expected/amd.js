define(['require'], (function (require) { 'use strict';

	var logo = new URL(require.toUrl('./assets/logo-da3mn9ig.svg'), document.baseURI).href;

	var logoReverse = new URL(require.toUrl('./assets/logo_reverse\'-m88qzsd0.svg'), document.baseURI).href;

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
