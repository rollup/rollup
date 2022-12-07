System.register(['./generated-dep.js'], (function (exports, module) {
	'use strict';
	var value;
	return {
		setters: [function (module) {
			value = module.v;
		}],
		execute: (function () {

			console.log('dynamic1', value);
			module.import('./generated-dynamic2.js');

		})
	};
}));
