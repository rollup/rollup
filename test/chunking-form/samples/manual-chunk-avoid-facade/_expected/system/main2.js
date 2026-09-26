System.register(['./generated-dep.js'], (function (exports) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
			exports("reexported", module.v);
		}],
		execute: (function () {

			console.log('main2', value);

		})
	};
}));
