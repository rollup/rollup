System.register(['./chunk1.js'], function (exports, module) {
	'use strict';
	var dep, log;
	return {
		setters: [function (module) {
			dep = module.dep;
			log = module.default;
		}],
		execute: function () {

			log(dep);

		}
	};
});
