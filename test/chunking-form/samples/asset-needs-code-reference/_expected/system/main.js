System.register([], (function (exports, module) {
	'use strict';
	return {
		execute: (function () {

			var asset2 = new URL('logo2.svg', module.meta.url).href;

			{
				const image = document.createElement('img');
				image.src = asset2;
				document.body.appendChild(image);
			}

		})
	};
}));
