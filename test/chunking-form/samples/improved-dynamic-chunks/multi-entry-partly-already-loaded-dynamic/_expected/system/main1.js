System.register(['./generated-dep2.js'], (function (exports, module) {
	'use strict';
	var value2;
	return {
		setters: [function (module) {
			value2 = module.v;
			exports('value2', module.v);
		}],
		execute: (function () {

			const value1 = exports("value1", 'shared1');

			console.log('main1', value1, value2);
			module.import('./generated-dynamic1.js');

		})
	};
}));
