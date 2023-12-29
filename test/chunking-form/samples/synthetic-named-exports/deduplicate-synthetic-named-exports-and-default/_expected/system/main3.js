System.register(['./main1.js'], (function (exports) {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.lib;
		}],
		execute: (function () {



			exports("foo", lib.foo);

		})
	};
}));
