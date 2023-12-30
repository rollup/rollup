System.register(['./generated-from-main-1-and-dynamic.js', './generated-from-main-1-and-2.js'], (function (exports, module) {
	'use strict';
	var value1, value2, value3;
	return {
		setters: [function (module) {
			value1 = module.v;
			exports("value1", module.v);
		}, function (module) {
			value2 = module.v;
			value3 = module.a;
			exports({ value2: module.v, value3: module.a });
		}],
		execute: (function () {

			console.log('main1', value1, value2, value3);
			module.import('./generated-dynamic.js');

		})
	};
}));
