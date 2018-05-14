System.register(['./main2alias-4b538eea.js'], function (exports, module) {
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
