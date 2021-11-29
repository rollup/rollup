System.register(['./generated-dep.js'], (function (exports, module) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
		}],
		execute: (function () {

			module.import('./ext\'ernal');

			console.log('main', value);

		})
	};
}));
