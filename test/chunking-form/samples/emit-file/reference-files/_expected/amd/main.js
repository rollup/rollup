define(['module', 'require', 'exports'], (function (module, require, exports) { 'use strict';

	var logo = new URL(require.toUrl('./assets/logo1-FquQRdV3.svg'), new URL(module.uri, document.baseURI).href).href;

	function showImage(url) {
		console.log(url);
		if (typeof document !== 'undefined') {
			const image = document.createElement('img');
			image.src = url;
			document.body.appendChild(image);
		}
	}

	showImage(logo);
	new Promise(function (resolve, reject) { require(['./nested/chunk'], resolve, reject); });

	exports.showImage = showImage;

}));
