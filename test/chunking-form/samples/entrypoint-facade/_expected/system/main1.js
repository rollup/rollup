System.register(['./main2-9c0ea573.js'], function (exports, module) {
	'use strict';
	var dep, log;
	return {
		setters: [function (module) {
			dep = module.dep;
			log = module.log;
		}],
		execute: function () {

			log(dep);

		}
	};
});
