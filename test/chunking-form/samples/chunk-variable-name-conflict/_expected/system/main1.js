System.register(['./generated-dep.js'], (function () {
	'use strict';
	var value, x;
	return {
		setters: [function (module) {
			value = module.v;
			x = module.x;
		}],
		execute: (function () {

			[43].map(dep => console.log(dep, value, x));

		})
	};
}));
