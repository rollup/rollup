System.register(['./generated-main.js'], (function (exports) {
	'use strict';
	var lib;
	return {
		setters: [function (module) {
			lib = module.l;
			exports("component", module.c);
		}],
		execute: (function () {



			exports("lib", lib.named.named);

		})
	};
}));
