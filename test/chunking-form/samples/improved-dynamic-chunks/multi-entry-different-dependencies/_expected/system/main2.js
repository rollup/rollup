System.register(['./generated-dep2.js'], (function (exports, module) {
	'use strict';
	var value2;
	return {
		setters: [function (module) {
			value2 = module.v;
			exports("value2", module.v);
		}],
		execute: (function () {

			console.log('main2', value2);
			module.import('./generated-dynamic.js');

		})
	};
}));
