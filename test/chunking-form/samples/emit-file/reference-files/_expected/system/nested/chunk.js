System.register(['../main.js'], (function (exports, module) {
	'use strict';
	var showImage;
	return {
		setters: [function (module) {
			showImage = module.s;
		}],
		execute: (function () {

			var logo = new URL('../assets/logo2-yX706C0w.svg', module.meta.url).href;

			showImage(logo);

		})
	};
}));
