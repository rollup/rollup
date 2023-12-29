System.register(['./main1.js', './generated-dep2.js'], (function (exports) {
	'use strict';
	var value1;
	return {
		setters: [function (module) {
			value1 = module.value1;
			exports("value1", module.value1);
		}, null],
		execute: (function () {

			console.log('dynamic1', value1);

		})
	};
}));
