System.register(['../main.js'], function (exports, module) {
	'use strict';
	var log;
	return {
		setters: [function (module) {
			log = module.l;
		}],
		execute: function () {

			log('nested: ' + module.meta.url);

		}
	};
});
