System.register(['./generated-shared.js'], (function (exports) {
	'use strict';
	var commonjsGlobal, shared;
	return {
		setters: [function (module) {
			commonjsGlobal = module.c;
			shared = module.s;
		}],
		execute: (function () {

			commonjsGlobal.fn = d => d + 1;
			var cjs = commonjsGlobal.fn;

			var main1 = exports("default", shared.map(cjs));

		})
	};
}));
