System.register(['./generated-dep.js'], (function () {
	'use strict';
	var dep;
	return {
		setters: [function (module) {
			dep = module.d;
		}],
		execute: (function () {

			console.log('2', dep);

		})
	};
}));
