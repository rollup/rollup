System.register(['./generated-dep2.js'], (function (exports) {
	'use strict';
	var dep, dep$1;
	return {
		setters: [function (module) {
			dep = module.d;
			dep$1 = module.a;
		}],
		execute: (function () {

			console.log('manual1');
			const manual$1 = exports("m", 'manual1:' + dep);

			console.log('manual2');
			const manual = exports("a", 'manual2:' + dep$1);

		})
	};
}));
