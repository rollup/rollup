System.register(['./generated-dep1.js', './generated-dep2.js'], (function (exports) {
	'use strict';
	var value1, value2;
	return {
		setters: [function (module) {
			value1 = module.v;
			exports("value1", module.v);
		}, function (module) {
			value2 = module.v;
			exports("value2", module.v);
		}],
		execute: (function () {

			console.log('dynamic1', value1, value2);

		})
	};
}));
