System.register(['./generated-main2alias.js'], function (exports, module) {
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
