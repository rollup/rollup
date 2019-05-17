System.register(['./chunk.js'], function (exports, module) {
	'use strict';
	var log;
	return {
		setters: [function (module) {
			log = module.a;
		}],
		execute: function () {

			log('nested: ' + module.meta.url);

		}
	};
});
