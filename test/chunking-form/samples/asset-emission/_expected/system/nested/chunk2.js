System.register(['./chunk.js'], function (exports, module) {
	'use strict';
	var showImage;
	return {
		setters: [function (module) {
			showImage = module.a;
		}],
		execute: function () {

			var logo = new URL('../assets/logo2-25253976.svg', module.meta.url).href;

			showImage(logo);

		}
	};
});
