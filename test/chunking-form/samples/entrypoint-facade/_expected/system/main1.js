System.register(['./generated-main2.js'], (function () {
	'use strict';
	var dep, log;
	return {
		setters: [function (module) {
			dep = module.d;
			log = module.l;
		}],
		execute: (function () {

			log(dep);

		})
	};
}));
