System.register(['./main.js'], (function (exports, module) {
	'use strict';
	var dep2;
	return {
		setters: [function (module) {
			dep2 = module.d;
		}],
		execute: (function () {

			console.log(dep2);
			module.import('./generated-dynamic.js');

		})
	};
}));
