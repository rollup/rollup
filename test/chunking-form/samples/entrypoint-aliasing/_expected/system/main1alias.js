System.register(['./generated-main2alias.js'], function () {
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
