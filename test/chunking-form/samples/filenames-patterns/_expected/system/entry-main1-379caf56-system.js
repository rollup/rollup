System.register(['./chunk-main2-63744fb4-system.js'], function () {
	'use strict';
	var log, dep;
	return {
		setters: [function (module) {
			log = module.l;
			dep = module.d;
		}],
		execute: function () {

			log(dep);

		}
	};
});
