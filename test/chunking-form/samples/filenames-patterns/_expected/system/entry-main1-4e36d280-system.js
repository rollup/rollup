System.register(['./chunk-main2-d134c6d9-system.js'], function (exports, module) {
	'use strict';
	var log, dep;
	return {
		setters: [function (module) {
			log = module.a;
			dep = module.b;
		}],
		execute: function () {

			log(dep);

		}
	};
});
