System.register(['./main2alias-9c0ea573.js'], function (exports, module) {
	'use strict';
	var dep, log;
	return {
		setters: [function (module) {
			dep = module.default$1;
			log = module.default;
		}],
		execute: function () {

			log(dep);

		}
	};
});
