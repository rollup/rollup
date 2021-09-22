System.register(['./generated-dep.js'], (function () {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
		}],
		execute: (function () {

			var dep = 44;
			console.log(dep, value);

		})
	};
}));
