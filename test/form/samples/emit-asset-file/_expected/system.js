System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var logo = new URL('assets/logo-Mw5Zq12q.svg', module.meta.url).href;

			function showImage(url) {
				console.log(url);
				if (typeof document !== 'undefined') {
					const image = document.createElement('img');
					image.src = url;
					document.body.appendChild(image);
				}
			}

			showImage(logo);

		})
	};
}));
