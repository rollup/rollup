System.register(['./generated-dep2.js'], (function (exports) {
	'use strict';
	var value2;
	return {
		setters: [function (module) {
			value2 = module.v;
			exports("value2", module.v);
		}],
		execute: (function () {

			console.log('dynamic2', value2);

		})
	};
}));
