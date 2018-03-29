System.register(['./main2alias-9c0ea573.js'], function (exports, module) {
	'use strict';
	var dep, log;
	return {
		setters: [function (module) {
			dep = module.a;
			log = module.b;
		}],
		execute: function () {

			log(dep);

		}
	};
});
