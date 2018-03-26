System.register(['./main2alias-42e739f9.js'], function (exports, module) {
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
