System.register(['./nested/chunk.js'], function (exports, module) {
	'use strict';
	var log;
	return {
		setters: [function (module) {
			log = module.a;
		}],
		execute: function () {

			log('main: ' + module.meta.url);
			module.import('./nested/chunk2.js');

		}
	};
});
