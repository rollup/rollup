System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			exports('s', showImage);

			var logo = new URL('assets/logo1-BarkEXVd.svg', module.meta.url).href;

			function showImage(url) {
				console.log(url);
				if (typeof document !== 'undefined') {
					const image = document.createElement('img');
					image.src = url;
					document.body.appendChild(image);
				}
			}

			showImage(logo);
			module.import('./nested/chunk.js');

		})
	};
}));
