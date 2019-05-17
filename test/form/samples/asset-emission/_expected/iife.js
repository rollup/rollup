(function () {
	'use strict';

	var logo = new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../assets/logo-25253976.svg').href;

	function showImage(url) {
		console.log(url);
		if (typeof document !== 'undefined') {
			const image = document.createElement('img');
			image.src = url;
			document.body.appendChild(image);
		}
	}

	showImage(logo);

}());
