define(['require'], (function (require) { 'use strict';

	var logo = new URL(require.toUrl('./assets/logo-a2a2cdc4.svg'), document.baseURI).href;

	function showImage(url) {
		console.log(url);
		if (typeof document !== 'undefined') {
			const image = document.createElement('img');
			image.src = url;
			document.body.appendChild(image);
		}
	}

	showImage(logo);

}));
