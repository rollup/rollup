System.register(['./chunk-main2-mm7slrpx-system.js'], (function () {
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
