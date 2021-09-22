System.register(['./generated-dep.js'], (function (exports, module) {
	'use strict';
	var value1;
	return {
		setters: [function (module) {
			value1 = module.v;
		}],
		execute: (function () {

			module.import('./generated-dynamic.js');
			console.log('shared', value1);

		})
	};
}));
