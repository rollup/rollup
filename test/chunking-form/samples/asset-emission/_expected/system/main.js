System.register(['./nested/chunk.js'], function (exports, module) {
	'use strict';
	var showImage;
	return {
		setters: [function (module) {
			showImage = module.s;
		}],
		execute: function () {

			var logo = new URL('assets/logo1-a5ec488b.svg', module.meta.url).href;

			showImage(logo);
			module.import('./nested/chunk2.js');

		}
	};
});
