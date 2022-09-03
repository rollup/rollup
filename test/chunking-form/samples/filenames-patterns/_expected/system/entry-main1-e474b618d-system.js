System.register(['./chunk-main2-9cc036248-system.js'], (function () {
	'use strict';
	var log, dep;
	return {
		setters: [function (module) {
			log = module.l;
			dep = module.d;
		}],
		execute: (function () {

			log(dep);

		})
	};
}));
