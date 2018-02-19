System.register(['./chunk1.js'], function (exports, module) {
	'use strict';
	var dep, log;
	return {
		setters: [function (module) {
			dep = module.b;
			log = module.a;
		}],
		execute: function () {

			log(dep);

		}
	};
});
