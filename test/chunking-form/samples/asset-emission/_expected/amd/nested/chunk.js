define(['exports'], function (exports) { 'use strict';

	function showImage(url) {
		console.log(url);
		if (typeof document !== 'undefined') {
			const image = document.createElement('img');
			image.src = url;
			document.body.appendChild(image);
		}
	}

	exports.showImage = showImage;

});
