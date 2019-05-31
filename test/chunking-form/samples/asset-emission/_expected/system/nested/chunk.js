System.register([], function (exports, module) {
	'use strict';
	return {
		execute: function () {

			exports('s', showImage);

			function showImage(url) {
				console.log(url);
				if (typeof document !== 'undefined') {
					const image = document.createElement('img');
					image.src = url;
					document.body.appendChild(image);
				}
			}

		}
	};
});
