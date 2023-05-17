System.register(['external2', './main1.js', 'external1'], (function (exports) {
	'use strict';
	return {
		setters: [function (module) {
			exports('foo', module.foo);
		}, null, null],
		execute: (function () {



		})
	};
}));
