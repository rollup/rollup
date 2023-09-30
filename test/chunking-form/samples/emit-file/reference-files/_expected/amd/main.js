define(['require', 'exports'], (function (require, exports) { 'use strict';

	var logo = new URL(require.toUrl('./assets/logo1-BarkEXVd.svg'), document.baseURI).href;

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
